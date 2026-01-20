import mongoose from "mongoose";
import {env} from "../config/env.js";


export const connectDB = async ()=>{
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to MongoDB");
    }catch (error){
        console.log("MongoDB Connection Failed ", error);
        process.exit(1);
    }
};