import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{
        userData: null,
        otherUsers: null,
        selectedUser: null
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
        }
    }
})

export const {setUserData,setotherUsers,setselectedUser} = userSlice.actions
export default userSlice.reducer
