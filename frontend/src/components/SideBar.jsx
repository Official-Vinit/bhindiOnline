import React, { useState } from 'react'
import axios from 'axios'
import {
	HiOutlineArrowRightOnRectangle,
	HiOutlineSpeakerXMark,
} from 'react-icons/hi2'
import { useDispatch, useSelector } from 'react-redux'
import { setotherUsers, setselectedUser, setUserData } from '../../redux/userSlice'
import { serverurl } from '../config/api'
import { useNavigate } from 'react-router-dom'

function getInitials(name = '') {
	const words = name.trim().split(/\s+/).filter(Boolean)
	if (!words.length) return 'U'
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
	return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export default function SideBar({
	conversations = [],
	onSelectChat = () => {}
}) {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { userData, selectedUser } = useSelector((state) => state.user)
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [logoutError, setLogoutError] = useState('')

	function handleSelectUser(chat) {
		dispatch(setselectedUser(chat))
		onSelectChat(chat)
	}

	async function handleLogout() {
		if (isLoggingOut) return

		setLogoutError('')
		setIsLoggingOut(true)

		try {
			await axios.get(`${serverurl}/api/auth/logout`, {
				withCredentials: true
			})

			dispatch(setotherUsers(null))
			dispatch(setselectedUser(null))
			dispatch(setUserData(null))
		} catch (error) {
			const message = error?.response?.data?.message || 'Unable to logout right now. Try again.'
			setLogoutError(message)
		} finally {
			setIsLoggingOut(false)
		}
	}

	return (
		<aside className="h-full bg-slate-950/95 text-slate-100 p-4 sm:p-5 flex flex-col border-b border-slate-800/70 lg:border-b-0 lg:border-r">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-2xl font-bold text-white tracking-tight">BhindiOnline</h2>
				<button
					type="button"
					onClick={() => navigate('/profile')}
					className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
					aria-label="Open profile"
				>
					<img
						src={userData?.image || '/logo.png'}
						alt="Profile"
						onError={(e) => {
							e.currentTarget.src = '/logo.png'
						}}
						className="w-12 h-12 rounded-full object-cover bg-white/10 p-1 shadow-md cursor-pointer hover:opacity-90 transition"
					/>
				</button>
			</div>
			<div className="flex items-center justify-between gap-3">
				<p className="mt-1 text-xs text-slate-500">Recent conversations</p>
				<p className="mt-1 text-xs text-slate-500 truncate">{userData?.name || userData?.userName}</p>
			</div>


			<div className="hide-scrollbar mt-4 flex-1 overflow-y-auto pr-1 space-y-2">
				{conversations?.map((chat) => {
					const chatId = chat?._id
					const displayName = chat?.name || chat?.userName || 'Unknown user'
					const active = chatId === selectedUser?._id

					return (
						<button
							key={chatId}
							type="button"
							onClick={() => handleSelectUser(chat)}
							className={`w-full text-left rounded-2xl p-3 transition border ${
								active
									? 'bg-slate-800 border-emerald-500/45 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]'
									: 'bg-slate-900/70 border-transparent hover:bg-slate-800/70'
							}`}
						>
							<div className="flex items-start gap-3">
								{chat?.image ? (
									<img
										src={chat.image}
										alt={displayName}
										onError={(e) => {
											e.currentTarget.src = '/logo.png'
										}}
										className="h-12 w-12 shrink-0 rounded-full object-cover bg-slate-800"
									/>
								) : (
									<div className="h-12 w-12 shrink-0 rounded-full grid place-items-center font-bold text-sm bg-emerald-600 text-white">
										{getInitials(displayName)}
									</div>
								)}

								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-3">
										<h3 className="text-base font-semibold text-slate-100 truncate">{displayName}</h3>
										<span className="text-xs text-slate-400 shrink-0">@{chat?.userName}</span>
									</div>

									<p className="text-sm text-slate-400 truncate mt-0.5">{chat?.email || 'No email'}</p>

									<div className="mt-1.5 flex items-center justify-between gap-3">
										<p className="text-sm text-slate-300 truncate">Tap to chat</p>

										<div className="flex items-center gap-1.5 shrink-0">
											{active && <HiOutlineSpeakerXMark className="text-emerald-400" />}
										</div>
									</div>
								</div>
							</div>
						</button>
					)
				})}

				{!conversations?.length && (
					<p className="text-sm text-slate-500 px-1">No users available to chat yet.</p>
				)}
			</div>

			<div className="pt-3 mt-3 border-t border-slate-800/70">
				{logoutError && (
					<p className="text-xs text-rose-300 mb-2">{logoutError}</p>
				)}

				<button
					type="button"
					onClick={handleLogout}
					disabled={isLoggingOut}
					className={`inline-flex items-center justify-start gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
						isLoggingOut
							? 'border-slate-700 bg-slate-800 text-slate-400 cursor-not-allowed'
							: 'border-rose-400/25 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20'
					}`}
				>
					<HiOutlineArrowRightOnRectangle className="text-base" />
					{isLoggingOut ? 'Signing out...' : 'Logout'}
				</button>
			</div>
		</aside>
	)
}
