import { NextFunction,Request,Response } from "express"
import fs from 'node:fs'
import path from 'node:path'
import cloudinary from "../config/cloudinary"
import bookModel from "./bookModel"
import { AuthRequest } from "../middlewares/authenticate"
import createHttpError from "http-errors"


const createBook = async(req:Request,res:Response,next:NextFunction) =>{
    const {title, genre} = req.body

    console.log('files', req.files)

    // upload those files in cloud eg. cloudinary
    const files = req.files as {[fieldname: string]: Express.Multer.File[]}
    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName)
   

    try{
    const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: 'book-covers',
        format: coverImageMimeType
    })
    



    // Uploading book pdf in cloudinary
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName)

    
    const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
        resource_type: 'raw',
        filename_override: bookFileName,
        folder: 'book-pdfs',
        format: "pdf"
    })



console.log('UploadResult', uploadResult)
console.log('bookFileUploadResult', bookFileUploadResult)

   //here getting userId from JWt
   const _req = req as AuthRequest
// create a book and store in db
const newBook = await bookModel.create({
    title,
    genre,
    author: _req.userId,
    coverImage: uploadResult.secure_url,
    file: bookFileUploadResult.secure_url

})

// Delete temporary files that is from public folder
await fs.promises.unlink(filePath)
await fs.promises.unlink(bookFilePath)


    
    res.status(201).json({id: newBook._id})
}
catch(err){
    console.error('Error uploading file to Cloudinary:', err);
    res.status(500).json({ err: 'Error uploading file to Cloudinary' });
}


}


const updateBook = async(req:Request,res:Response,next:NextFunction) => {

    const {title, genre} = req.body
    const bookId = req.params.bookId



    //searching book by id
    const book = await bookModel.findOne({_id: bookId})

    if(!book){
        return next(createHttpError(404, " book not found"))
    }

    //check access if the same author trying to update
    const _req = req as AuthRequest
    if(book.author.toString() !== _req.userId){
       return next(createHttpError(403, "Unauthorized access to update"))
    }

     // check if image field is exists.

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    // send files to cloudinary
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    completeCoverImage = filename;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "book-pdfs",
      format: converMimeType,
    });

    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }

  // check if file field is exists.
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-pdfs",
      format: "pdf",
    });

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
    },
    { new: true }
  );

  res.json(updatedBook);

}


const getBooks = async(req:Request, res:Response, next:NextFunction) => {
   try{
    //ToDo: Add Pagination
    const books = await bookModel.find();
    res.json(books)
   }
   catch(err){
    return next(createHttpError(500,"Error while getting books"))
   }
    
}

const getBook = async(req:Request, res:Response, next:NextFunction) => {
    // getting book Id from params
    const bookId = req.params.bookId

    try{
        const book = await bookModel.findOne({_id: bookId})
        if(!book){
            return next(createHttpError(404, "No book is present with that id"))
        }
        return res.json(book)
    }
    catch(err){
        return next(createHttpError(500,"Error while getting book"))
    }
}


const deleteBook = async(req:Request, res:Response, next:NextFunction) =>{
    const bookId = req.params.bookId
    try{
        const book = await bookModel.findOne({_id: bookId})

        if(!book){
            return next(createHttpError(404, "No book found with that id"))
        }

        //check access to delete
        const _req = req as AuthRequest
        if(book.author.toString() !== _req.userId){
            return next(createHttpError(403, "Not access to delete this"))
        }

        // delete from cloudinary
        
        // splitting db file url to delete from cloudinary
        // book-covers/dkzujeho0txi0yrfqjsm
        // https://res.cloudinary.com/degzfrkse/image/upload/v1712590372/book-covers/u4bt9x7sv0r0cg5cuynm.png

        const coverFileSplits = book.coverImage.split("/");
        const coverImagePublicId =
          coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);
      

        const bookFileSplits = book.file.split("/");
        const bookFilePublicId = bookFileSplits.at(-2) + "/" +      bookFileSplits.at(-1)


        await cloudinary.uploader.destroy(coverImagePublicId)
        await cloudinary.uploader.destroy(bookFilePublicId, {
            resource_type: 'raw'
        })

        await bookModel.deleteOne({_id: bookId})


        return res.sendStatus(204);
    }
    catch(err){
        return next(createHttpError(500, "Error while deleting the book"))
    }

    

}
export {createBook, updateBook, getBooks, getBook, deleteBook}