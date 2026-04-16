import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { serverurl } from '../config/api'
import { setUserData } from '../../redux/userSlice'

export default function Profile() {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const imageInputRef = useRef(null)
  const previewUrlRef = useRef(null)

  const [name, setName] = useState('')
  const [frontendImage, setFrontendImage] = useState('/logo.png')
  const [backendImage, setBackendImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setName(userData?.name || '')
    setFrontendImage(userData?.image || '/logo.png')
    setBackendImage(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }, [userData?.name, userData?.image])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const normalizedCurrentName = (userData?.name || '').trim()
  const normalizedName = name.trim()
  const hasNameChange = normalizedName !== normalizedCurrentName
  const hasImageChange = Boolean(backendImage)
  const canSubmit = normalizedName.length > 0 && (hasNameChange || hasImageChange)

  function handleImageChange(e) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const previewUrl = URL.createObjectURL(selectedFile)
    previewUrlRef.current = previewUrl

    setFrontendImage(previewUrl)
    setBackendImage(selectedFile)
    if (error) setError('')
    if (success) setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!normalizedName) {
      setError('Name is required')
      return
    }

    if (!hasNameChange && !hasImageChange) {
      setError('No changes to update')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('name', normalizedName)
      if (backendImage) {
        formData.append('image', backendImage)
      }

      const result = await axios.put(
        `${serverurl}/api/user/profile`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      dispatch(setUserData(result.data))
      setSuccess('Profile updated successfully.')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to update profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-green-700 to-green-500 text-white shadow-lg overflow-hidden relative">
          <div className="absolute -left-20 -top-10 opacity-30 transform rotate-12">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="220" height="220" rx="44" fill="white" />
            </svg>
          </div>

          <img
            src={frontendImage || '/logo.png'}
            alt="Profile"
            onError={(e) => {
              e.currentTarget.src = '/logo.png'
            }}
            className="w-32 h-32 rounded-full object-cover bg-white/20 p-1 shadow-md border-4 border-white/40"
          />

          <h1 className="mt-6 text-3xl font-extrabold">Your Profile</h1>
          <p className="mt-2 text-green-100 text-center max-w-xs">View and update your details while keeping your Bhindi vibe fresh.</p>

          <div className="mt-8 w-full space-y-3">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-xs text-green-100">Name</p>
              <p className="font-semibold text-white">{userData?.name || 'Not set yet'}</p>
            </div>

            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-xs text-green-100">Username</p>
              <p className="font-semibold text-white">{userData?.userName || '-'}</p>
            </div>

            <div className="bg-white/10 rounded-xl px-4 py-3 break-all">
              <p className="text-xs text-green-100">Email</p>
              <p className="font-semibold text-white">{userData?.email || '-'}</p>
            </div>
          </div>

          <svg className="absolute -right-10 bottom-10 opacity-20" width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="70" r="70" fill="white" />
          </svg>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="Bhindi logo" className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Update Profile</h2>
              <p className="text-sm text-slate-500">Update your name and choose a new profile image.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError('')
                  if (success) setSuccess('')
                }}
                placeholder="Your full name"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Profile Image</label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                Choose image
              </button>
              <p className="mt-2 text-xs text-slate-500 truncate">
                {backendImage ? backendImage.name : 'No new file selected'}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-800">{error}</div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 border border-green-100 p-3 text-sm text-green-800">{success}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold shadow-sm transition ${
                  canSubmit && !loading ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {loading ? 'Updating...' : 'Save changes'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            Back to chat: <Link to="/" className="text-green-600 font-semibold">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
