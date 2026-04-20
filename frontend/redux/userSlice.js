import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{
        userData: null,
        otherUsers: null,
        selectedUser: null,
        onlineUsers:null
    },
    reducers:{
        setUserData:(state,action)=>{
            state.userData=action.payload
        },
        setotherUsers:(state,action)=>{
            state.otherUsers=action.payload
        },
        setselectedUser:(state,action)=>{
            state.selectedUser=action.payload
        },
        setOnlineUsers:(state,action)=>{
            state.onlineUsers=action.payload
        }
    }
})

export const {setUserData,setotherUsers,setselectedUser,setOnlineUsers} = userSlice.actions
export default userSlice.reducer
