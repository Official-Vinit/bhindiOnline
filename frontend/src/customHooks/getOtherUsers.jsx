import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { serverurl } from "../config/api"
import axios from 'axios'
import { setotherUsers } from "../../redux/userSlice"

const getOtherUsers = (skip = false) => {
    let dispatch = useDispatch()
    const { userData } = useSelector((state) => state.user)

    const normalize = (value) => String(value || "").trim().toLowerCase()

    useEffect(()=>{
        if (skip || !userData) {
            dispatch(setotherUsers([]))
            return
        }

        const fetchUser = async()=>{
            try{
                let result = await axios.get(`${serverurl}/api/user/others`,{withCredentials:true})
                const users = Array.isArray(result.data) ? result.data : []

                const currentUserId = String(userData?._id || "")
                const currentUserEmail = normalize(userData?.email)
                const currentUserName = normalize(userData?.userName)

                const filteredUsers = users.filter((user) => {
                    if (!user) return false

                    const sameId = currentUserId && String(user?._id || "") === currentUserId
                    const sameEmail = currentUserEmail && normalize(user?.email) === currentUserEmail
                    const sameUserName = currentUserName && normalize(user?.userName) === currentUserName

                    return !sameId && !sameEmail && !sameUserName
                })

                dispatch(setotherUsers(filteredUsers))
            }catch(error){
                console.log(error)
                dispatch(setotherUsers([]))
            }
        }
        fetchUser()
    },[dispatch, skip, userData])
}

export default getOtherUsers;