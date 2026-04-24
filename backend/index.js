import express from "express"
import dotenv  from "dotenv"
import connectDb from "./config/db.js";
import cors from "cors";

import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";

dotenv.config()

const port = process.env.PORT||8000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"
const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.status(200).json({message:'Backend is running'})
});

app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/message',messageRouter);


server.listen(port,()=>{
    connectDb()
    console.log(`server listening at port:${port}`)
});
