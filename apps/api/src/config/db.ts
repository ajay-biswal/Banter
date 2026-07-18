import mongoose from "mongoose";
import {env} from "../config/env.js";


export const connectDB = async ()=>{
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to MongoDB");
    }catch (error: any) {
    console.dir(error, { depth: null });

    if (error.reason?.servers) {
        for (const [host, server] of error.reason.servers) {
            console.log("\n==========");
            console.log(host);
            console.dir(server.error, { depth: null });
        }
    }

    process.exit(1);
}
};