import mongoose from "mongoose";

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connnected")
    }catch(error){
        console.log("MongoDB error")
    }
}

export default connectDb;