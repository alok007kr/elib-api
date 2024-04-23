import express from 'express'
import path from 'node:path'
import {createBook, deleteBook, getBook, getBooks, updateBook} from "./bookController"
import multer from 'multer';
import authenticate from '../middlewares/authenticate';

 

const bookRouter = express.Router();


// Uploading files for image and pdf using multer, Currently it stores in local, later to cloud then we can delete it from local
const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    limits: {fileSize: 3e7} // 30mb
})

//routes
// UserRouter.post('/', ()=> { res.json: "success"})
bookRouter.post('/',
authenticate,
 upload.fields([
    {name: 'coverImage', maxCount: 1},
    {name: 'file', maxCount: 1}
]), createBook)

bookRouter.patch('/:booksId', authenticate, upload.fields([
    {name: 'coverImage', maxCount: 1},
    {name: 'file', maxCount: 1}
]), updateBook)

bookRouter.get('/', getBooks)
bookRouter.get('/:bookId', getBook)
bookRouter.delete('/:bookId', authenticate, deleteBook)

export default bookRouter