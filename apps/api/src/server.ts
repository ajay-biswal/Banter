import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import {env} from "./config/env.js";
import { initSocket } from "./socket/index.js";

const startServer = async () =>{
    try{
        await connectDB();

        const server = app.listen(env.PORT, ()=>{
            console.log(`Server running on port ${env.PORT}`);
        });

        // Initialize Socket.IO
        const io = initSocket(server);
        app.set("io", io);

        // Graceful shutdown
        process.on("SIGTERM",()=>{
            console.log("SIGTERM received. Shutting down...");
            server.close(()=> process.exit(0));
        });

        process.on("SIGINT",()=>{
            console.log("SIGINT received. Shutting down...");
            server.close(()=>process.exit(1));
        });
    }catch (error){
        console.log("Failed to start the server ", error);
        process.exit(1);
    }
};

startServer();
