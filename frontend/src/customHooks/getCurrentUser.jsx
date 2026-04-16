import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { serverurl } from "../main"
import axios from 'axios'
import { setUserData } from "../../redux/userSlice"


const getCurrentUser = ()=>{
    let dispatch = useDispatch()
    useEffect(()=>{
        const fetchUser = async()=>{
            try{
                let result = await axios.get(`${serverurl}/api/user/current`,{withCredentials:true})
                dispatch(setUserData(result.data))
            }catch(error){
                dispatch(setUserData(null))
            }
        }
        fetchUser()
    },[dispatch])
}

export default getCurrentUser;