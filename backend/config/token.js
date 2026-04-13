import jwt from "jsonwebtoken"

const genToken = async(userId)=>{
    try{
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "2d" })
        return token
    }catch(error){
        console.log("Generation of token error")
    }
}

export default genToken;