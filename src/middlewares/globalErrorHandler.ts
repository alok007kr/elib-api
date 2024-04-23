import { NextFunction, Request, Response } from "express"
import { HttpError } from "http-errors"
import { config } from "../config/config"


// Global error handler: it has 4 params
const globalErrorHandler = (err:HttpError,req:Request,res:Response,next:NextFunction) => {
    const statusCode = err.statusCode || 500


    return res.status(statusCode).json({
       message: err.message,
        // Never share during production
        // errorStack: err.stack,
        errorStack: config.env === 'development' ? err.stack: ""
    })
   
}

export default globalErrorHandler