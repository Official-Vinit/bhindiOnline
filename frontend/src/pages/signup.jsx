import React, { useState } from 'react'
import axios from 'axios'
import { serverurl } from '../config/api'
import { useDispatch } from 'react-redux'
import { setUserData } from '../../redux/userSlice.js'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  let dispatch = useDispatch()
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) {
      setError('Please fill all fields')
      return
    }
    setLoading(true)
    setSubmitted(false)
    setError("")
    try {
      const result = await axios.post(`${serverurl}/api/auth/signup`, {
        userName: form.username,
        email: form.email,
        password: form.password
      }, {
        withCredentials: true
      })
      dispatch(setUserData(result.data))
      console.log(result)
      setForm({ username: '', email: '', password: '' })
      navigate('/profile')
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      const message = err?.response?.data?.message || err.message || 'An unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = form.username && form.email && form.password

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-green-700 to-green-500 text-white shadow-lg overflow-hidden relative">
          <div className="absolute -left-20 -top-10 opacity-30 transform rotate-12">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="220" height="220" rx="44" fill="white" />
            </svg>
          </div>

          <img src="/logo.png" alt="Bhindi logo" className="w-28 h-28 rounded-full bg-white/20 p-2 shadow-md" />

          <h2 className="mt-6 text-3xl font-extrabold">Chat with Bhindi</h2>
          <p className="mt-2 text-green-100 text-center max-w-xs">A friendly place to chat, ask, and explore together — real-time feels and smiling vegetables.</p>

          <div className="mt-8 space-y-3 w-full flex flex-col items-center">
            <div className="w-3/4 bg-white/10 rounded-full px-4 py-2 text-sm">Start conversations</div>
            <div className="w-2/3 bg-white/10 rounded-full px-4 py-2 text-sm">Share quick thoughts</div>
            <div className="w-1/2 bg-white/10 rounded-full px-4 py-2 text-sm">Stay connected</div>
          </div>

          <svg className="absolute -right-10 bottom-10 opacity-20" width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="70" r="70" fill="white" />
          </svg>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="Bhindi logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
              <p className="text-sm text-slate-500">Join BhindiChat — Chat with your Bhindi</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. greenfriend"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Choose a strong password"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2 top-2 text-slate-500 px-3 py-1 rounded-md"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
            <div className="mt-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-800">{error}</div>
          )}

            <div>
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold shadow-sm transition ${
                  canSubmit && !loading ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Create account
              </button>
            </div>
          </form>

          {submitted && (
            <div className="mt-4 rounded-md bg-green-50 border border-green-100 p-3 text-sm text-green-800">Account created successfully.</div>
          )}

          <p className="text-center text-sm text-slate-500 mt-4">Already have an account? <a href="/login" className="text-green-600 font-semibold">Log in</a></p>
        </div>
      </div>
    </div>
  )
}