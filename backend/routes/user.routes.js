import express from "express"
import { getCurrentUser, getOtherUsers, updateProfile } from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"

const userRouter = express.Router()

userRouter.get('/current',isAuth,getCurrentUser)
userRouter.put('/profile',isAuth, upload.single("image"), updateProfile)
userRouter.get('/others',isAuth,getOtherUsers)

export default userRouter;