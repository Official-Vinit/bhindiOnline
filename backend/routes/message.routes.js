import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {upload} from "../middlewares/multer.js"
import { sendMessage } from "../controllers/message.controllers.js"
import { getMessage } from "../controllers/message.controllers.js"

const messageRouter = express.Router()

messageRouter.post('/send/:receiverId',isAuth,upload.single("image"),sendMessage)
messageRouter.get('/get/:receiverId',isAuth,getMessage)

export default messageRouter;