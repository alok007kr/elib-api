import mongoose from 'mongoose';


const connectDB = async() => {
    try{


        mongoose.connection.on('connected', () => {
            console.log("connected to DB")
        })

        mongoose.connection.on('error', (err) => {
            console.log("error in connecting to DB", err)
        })

        await mongoose.connect('mongodb+srv://23595alok2021:pOU0oECF7TAK4fWG@cluster0.zcvanfe.mongodb.net/?retryWrites=true&w=majority&ssl=true&appName=Cluster0');

    }
    catch(err){
        console.log("Failed to connect to DB", err)
        process.exit(1);
    }
}


export default connectDB;