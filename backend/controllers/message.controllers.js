import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req,res)=>{
    try{
        const sender = req.userId
        const {receiverId} = req.params
        const rawMessage = typeof req.body?.messageContent === "string"
            ? req.body.messageContent
            : req.body?.message
        const messageContent = typeof rawMessage === "string" ? rawMessage.trim() : ""

        if (!messageContent && !req.file) {
            return res.status(400).json({ message: "Message content or image is required" })
        }

        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path)
        }
        let conversation = await Conversation.findOne({
            participants:{$all:[sender,receiverId]}
        })

        const newMessage = await Message.create({
            sender,
            receiver: receiverId,
            messageContent,
            image: image || ""
        })

        if(!conversation){
            await Conversation.create({
                participants:[
                    sender,receiverId
                ],
                messages:[newMessage._id]
            })
        }else{
            conversation.messages.push(newMessage._id)
            await conversation.save()
        }

        return res.status(201).json({newMessage})
    }catch(error){
        return res.status(500).json({message:`send message error${error}`})
    }
}

export const getMessage = async (req,res)=>{
    try{
        const sender = req.userId
        const {receiverId} = req.params
        const conversation = await Conversation.findOne({
            participants:{$all:[sender,receiverId]}
        }).populate({
            path: "messages",
            options: { sort: { createdAt: 1 } }
        })

        if(!conversation){
            return res.status(200).json([])
        }

        return res.status(200).json(conversation.messages)
    }catch(error){
        return res.status(500).json({message:`internal server error`})
    }
}