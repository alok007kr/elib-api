import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from 'bcrypt'
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async(req:Request,res:Response,next:NextFunction) => {
    //validation -> process -> response
    // Validation
    const {name, email, password} = req.body;
    console.log(req.body.email)
    if(!name || !email || !password){
        // creating error
        const error = createHttpError(400, "All fields are required")
        // passing this error to global error handler
        return next(error)
    }
    // Database call to process

    try{
        const user = await userModel.findOne({email: email});
        if(user){
            const error = createHttpError(400, 'User already exists with this email')
            return next(error)
        }
    }
    catch(err){
        return next(createHttpError(500, "Error while getting user"))
    }
   
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Store the user in database

    let newUser:User;
    try{
        newUser = await userModel.create({
            name,
            email,
            password : hashedPassword,
        })
    }
    catch(err){
        return next(createHttpError(500, "Error while creating user"))
    }
    
    

    //JWT token generation
    try{
        const token = sign({sub: newUser._id}, 'randomString', {
            expiresIn: "7d",
        })
    
    
        // return access token
        res.status(201).json({accessToken: token})
    }
    catch(err){
        return next(createHttpError(500, "Error while sigin the JWT token"))
    }
    
}

const loginUser = async(req:Request, res:Response, next:NextFunction) =>{
    // get the data from body
    const {email, password} = req.body;

    if(!email || !password){
        return next(createHttpError(400, "All fields are required"))
    }
    
    let user;
    //finding the user in db
    try{
        user = await userModel.findOne({email})

    if(!user){
        return next(createHttpError(404, "user not found"))
    }
    }
    catch(err){
        return next(createHttpError(400," Error while finding user"))
    }
    

    // verification for login
    try{
        const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        return next(createHttpError(400, "Username or Password incorrect"))
    }
    }
    catch(err){
        return next(createHttpError(400, "Error while verification login"))
    }
    

   try{
     //if login then create token
     const token = sign({sub: user._id}, 'randomString', {expiresIn: "7D"})


     res.status(200).json({accessToken: token})
   }
   catch(err){
    return next(createHttpError(400, " Error while accessing token"))
   }
}

export {createUser, loginUser}