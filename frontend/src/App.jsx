import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/login'
import Signup from './pages/signup'
import getCurrentUser from './customHooks/getCurrentUser'
import Home from './pages/Home'
import Profile from './pages/Profile'
import { useDispatch, useSelector } from 'react-redux'
import getOtherUsers from './customHooks/getOtherUsers'
import { useEffect } from 'react'
import { setOnlineUsers } from '../redux/userSlice'
import { connectSocket, disconnectSocket } from './config/socket'

function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  getCurrentUser(isAuthPage)
  getOtherUsers(isAuthPage)
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!userData?._id) {
      dispatch(setOnlineUsers([]))
      disconnectSocket()
      return
    }

    const socketio = connectSocket(userData._id)
    if (!socketio) return

    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(Array.isArray(users) ? users : []))
    }

    socketio.on('getOnlineUsers', handleOnlineUsers)

    return () => {
      socketio.off('getOnlineUsers', handleOnlineUsers)
      disconnectSocket()
      dispatch(setOnlineUsers([]))
    }
  }, [dispatch, userData?._id])

  

  return (
    <Routes>
      <Route path="/login" element={!userData?<Login/>:<Navigate to="/"/>} />
      <Route path="/signup" element={!userData?<Signup/>:<Navigate to="/profile"/>} />
      <Route path="/" element = {userData?<Home/>:<Navigate to="/login"/>}/>
      <Route path="/profile" element={userData?<Profile/>:<Navigate to="/signup"/>}/>
    </Routes>
  )
}

export default App