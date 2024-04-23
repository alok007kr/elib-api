const express = require('express')
import bookRouter from "./book/bookRouter"
import globalErrorHandler from "./middlewares/globalErrorHandler"
import userRouter from "./user/userRouter"
import cors from 'cors'




const app = express()
app.use(cors({
    origin: 'http://localhost:3000',
}))
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// used to get parse data I.E. register data: name,email and all
app.use(express.json())

// Routes
app.get('/', (req:any, res:any, next:any) => {
    res.json({message: "Welcome to the API"})
})

app.use('/api/users',userRouter);
app.use('/api/books', bookRouter)

// Global error handler: it has 4 params
// app.use() : files moved to geh.ts 
app.use(globalErrorHandler)


export default app;