import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { serverurl } from "../config/api"
import axios from 'axios'
import { setUserData } from "../../redux/userSlice"

const getCurrentUser = (skip = false) => {
    let dispatch = useDispatch()
    useEffect(()=>{
        if (skip) return

        const fetchUser = async()=>{
            try{
                let result = await axios.get(`${serverurl}/api/user/current`,{withCredentials:true})
                dispatch(setUserData(result.data))
            }catch(error){
                dispatch(setUserData(null))
            }
        }
        fetchUser()
    },[dispatch, skip])
}

export default getCurrentUser;