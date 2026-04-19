import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/login'
import Signup from './pages/signup'
import getCurrentUser from './customHooks/getCurrentUser'
import Home from './pages/Home'
import Profile from './pages/Profile'
import { useSelector } from 'react-redux'
import getOtherUsers from './customHooks/getOtherUsers'

function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  getCurrentUser(isAuthPage)
  getOtherUsers(isAuthPage)
  let {userData} = useSelector(state=>state.user)
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