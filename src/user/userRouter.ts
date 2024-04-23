import express from 'express'
import { createUser, loginUser } from './userController'; 

const userRouter = express.Router();


//routes
// UserRouter.post('/', ()=> { res.json: "success"})
userRouter.post('/register', createUser)
userRouter.post('/login', loginUser)
export default userRouter