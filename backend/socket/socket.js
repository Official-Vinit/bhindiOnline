import http from "http"
import express from "express"
import { Server } from "socket.io"
const app = express()


const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials:true
    }
})
const userSocketMap = {}
const getReceiverSocketId = (receiverId)=>{
    return userSocketMap[String(receiverId)]
}
io.on("connection",(socket)=>{
    const userId = socket.handshake.query?.userId
    if(userId && userId!=="undefined" && userId!=="null"){
        userSocketMap[userId]=socket.id
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    }
    socket.on("disconnect",()=>{
        if(userId && userSocketMap[userId]===socket.id){
            delete userSocketMap[userId]
            io.emit("getOnlineUsers",Object.keys(userSocketMap))
        }
    })
})




export {app,io,server,userSocketMap,getReceiverSocketId}
