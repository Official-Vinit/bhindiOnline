import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const getCurrentUser = async(req,res)=>{
    try{
        let userId = req.userId;
        let user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }

        return res.status(200).json(user)
    }catch(error){
        return res.status(500).json({message:`user fetch error ${error}`})
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (typeof name !== "string") {
                return res.status(400).json({ message: "Name must be a string" });
            }

            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({ message: "Name cannot be empty" });
            }

            updates.name = trimmedName;
        }

        if (req.file) {
            const imageUrl = await uploadOnCloudinary(req.file.path);
            if (!imageUrl) {
                return res.status(500).json({ message: "Failed to upload image" });
            }
            updates.image = imageUrl;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No profile fields provided" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `profile update error ${error}` });
    }
};