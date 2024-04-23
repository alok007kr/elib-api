import { NextFunction,Request,Response } from "express";
import createHttpError from "http-errors";
import {verify} from 'jsonwebtoken'
import { config } from "../config/config";


export interface AuthRequest extends Request{
    userId: string
}
const authenticate = (req:Request,res:Response,next:NextFunction) => {

    // get JWT token
    const token = req.header('Authorization')
    if(!token){
        return next(createHttpError(401, "Authorization token is required"))
    }

    
    // config.jwtSecret as string
    try{
        const parsedToken = token.split(' ')[1];
    const decoded = verify(parsedToken, "randomString")
      //getting user id from jwt token
    //   console.log('decoded', decoded)
    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string
    }
    catch(err){
        return next(createHttpError(401, "Token expired"))
    }

     
    next();
}

export default authenticate