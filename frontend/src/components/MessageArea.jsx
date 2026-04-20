import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { HiChevronLeft, HiOutlineFaceSmile, HiOutlinePhoto, HiXMark } from 'react-icons/hi2'
import { useSelector } from 'react-redux'
import { serverurl } from '../config/api'
import { getSocket } from '../config/socket'


const QUICK_EMOJIS = ['😀', '😂', '😍', '😎', '🔥', '👏', '😭', '👍', '🙏', '🎉', '✨', '❤️']

function getInitials(name = '') {
	const words = name.trim().split(/\s+/).filter(Boolean)
	if (!words.length) return 'U'
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
	return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export default function MessageArea({
	showBackButton = false,
	onBack = () => {}
}) {
	const { selectedUser, userData, onlineUsers } = useSelector((state) => state.user)
	const [messages, setMessages] = useState([])
	const [messageInput, setMessageInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isSending, setIsSending] = useState(false)
	const [errorText, setErrorText] = useState('')
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [selectedImageFile, setSelectedImageFile] = useState(null)
	const [selectedImagePreview, setSelectedImagePreview] = useState('')
	const [viewerImage, setViewerImage] = useState('')
	const messageEndRef = useRef(null)
	const emojiPickerRef = useRef(null)
	const fileInputRef = useRef(null)

	const selectedUserId = selectedUser?._id
	const currentUserId = userData?._id

	useEffect(() => {
		if (!selectedUserId) {
			setMessages([])
			setMessageInput('')
			setErrorText('')
			setShowEmojiPicker(false)
			setViewerImage('')
			setIsLoading(false)
			return
		}

		let isMounted = true

		const fetchConversation = async () => {
			setIsLoading(true)
			setErrorText('')

			try {
				const response = await axios.get(`${serverurl}/api/message/get/${selectedUserId}`, {
					withCredentials: true
				})

				if (!isMounted) return

				const payload = response?.data
				const incomingMessages = Array.isArray(payload)
					? payload
					: Array.isArray(payload?.messages)
						? payload.messages
						: []

				setMessages(incomingMessages)
			} catch (error) {
				if (!isMounted) return

				if (error?.response?.status === 400 || error?.response?.status === 404) {
					setMessages([])
					setErrorText('')
				} else {
					setErrorText(error?.response?.data?.message || 'Unable to load messages right now.')
				}
			} finally {
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}

		fetchConversation()

		return () => {
			isMounted = false
		}
	}, [selectedUserId])

	useEffect(() => {
		if (!showEmojiPicker) return

		function handleClickOutside(event) {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				setShowEmojiPicker(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showEmojiPicker])

	useEffect(() => {
		return () => {
			if (selectedImagePreview) {
				URL.revokeObjectURL(selectedImagePreview)
			}
		}
	}, [selectedImagePreview])

	useEffect(() => {
		if (!messageEndRef.current) return
		messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
	}, [messages, isLoading])

	useEffect(() => {
		const socket = getSocket()
		if (!socket || !selectedUserId || !currentUserId) return

		const handleNewMessage = (newMessage) => {
			if (!newMessage) return

			const isFromSelectedToCurrent =
				String(newMessage.sender) === String(selectedUserId) &&
				String(newMessage.receiver) === String(currentUserId)

			const isFromCurrentToSelected =
				String(newMessage.sender) === String(currentUserId) &&
				String(newMessage.receiver) === String(selectedUserId)

			if (!isFromSelectedToCurrent && !isFromCurrentToSelected) return

			setMessages((prev) => {
				const alreadyExists = prev.some((message) => message?._id && message._id === newMessage._id)
				if (alreadyExists) return prev
				return [...prev, newMessage]
			})
		}

		socket.on('new message', handleNewMessage)

		return () => {
			socket.off('new message', handleNewMessage)
		}
	}, [selectedUserId, currentUserId, onlineUsers])

	useEffect(() => {
		if (!viewerImage) return

		function handleKeyDown(event) {
			if (event.key === 'Escape') {
				setViewerImage('')
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [viewerImage])

	const hasPastConversation = messages.length > 0

	function formatMessageTime(dateValue) {
		if (!dateValue) return ''
		const date = new Date(dateValue)
		if (Number.isNaN(date.getTime())) return ''
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	}

	function clearSelectedImage() {
		if (selectedImagePreview) {
			URL.revokeObjectURL(selectedImagePreview)
		}
		setSelectedImageFile(null)
		setSelectedImagePreview('')
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	function handleEmojiSelect(emoji) {
		setMessageInput((prev) => `${prev}${emoji}`)
	}

	function handleImageSelection(event) {
		const file = event.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			setErrorText('Please select a valid image file.')
			return
		}

		if (selectedImagePreview) {
			URL.revokeObjectURL(selectedImagePreview)
		}

		const previewUrl = URL.createObjectURL(file)
		setSelectedImageFile(file)
		setSelectedImagePreview(previewUrl)
		setErrorText('')
	}

	async function handleSendMessage(event) {
		event.preventDefault()

		if (!selectedUserId || isSending) return

		const trimmedMessage = messageInput.trim()
		const hasImage = Boolean(selectedImageFile)
		if (!trimmedMessage && !hasImage) return

		setIsSending(true)
		setErrorText('')

		try {
			const formData = new FormData()
			if (trimmedMessage) {
				formData.append('messageContent', trimmedMessage)
			}
			if (selectedImageFile) {
				formData.append('image', selectedImageFile)
			}

			const response = await axios.post(
				`${serverurl}/api/message/send/${selectedUserId}`,
				formData,
				{
					withCredentials: true,
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			)

			const createdMessage = response?.data?.newMessage || {
				_id: `${Date.now()}`,
				sender: currentUserId,
				receiver: selectedUserId,
				messageContent: trimmedMessage,
				image: '',
				createdAt: new Date().toISOString()
			}

			setMessages((prev) => [
				...prev,
				{
					...createdMessage,
					messageContent: createdMessage?.messageContent || trimmedMessage,
					image: createdMessage?.image || ''
				}
			])
			setMessageInput('')
			setShowEmojiPicker(false)
			clearSelectedImage()
		} catch (error) {
			setErrorText(error?.response?.data?.message || 'Failed to send message. Try again.')
		} finally {
			setIsSending(false)
		}
	}

	if (!selectedUser) {
		return (
			<section className="h-full bg-slate-900/95 text-slate-100 grid place-items-center px-6">
				<div className="w-full max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-xl p-8 text-center">
					<div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 grid place-items-center text-2xl font-bold">
						B
					</div>
					<h2 className="mt-5 text-2xl sm:text-3xl font-bold text-white">Welcome To BhindiOnline</h2>
					<p className="mt-3 text-slate-400 text-sm sm:text-base">
						Choose a user and start chatting.
					</p>
				</div>
			</section>
		)
	}

	const displayName = selectedUser?.name || selectedUser?.userName || 'User'
	const displayStatus = selectedUser?.userName ? `@${selectedUser.userName}` : 'BhindiOnline User'
	const displayAvatarText = getInitials(displayName)

	return (
		<section className="h-full min-h-0 bg-slate-900/95 text-slate-100 flex flex-col overflow-hidden">
			<header className="shrink-0 px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70">
				<div className="min-w-0 flex items-center gap-3">
					{showBackButton && (
						<button
							type="button"
							onClick={onBack}
							className="h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-700 transition grid place-items-center text-slate-200 lg:hidden"
							aria-label="Back to chats"
						>
							<HiChevronLeft className="text-xl" />
						</button>
					)}

					{selectedUser?.image ? (
						<img
							src={selectedUser.image}
							alt={displayName}
							onError={(e) => {
								e.currentTarget.src = '/logo.png'
							}}
							className="h-11 w-11 rounded-full object-cover bg-slate-800"
						/>
					) : (
						<div className="h-11 w-11 rounded-full grid place-items-center font-bold bg-emerald-600">
							<span className="text-white text-sm">{displayAvatarText || 'U'}</span>
						</div>
					)}
					<div className="min-w-0">
						<h3 className="text-base sm:text-lg font-semibold truncate">{displayName}</h3>
						<p className="text-xs sm:text-sm text-slate-400 truncate">{displayStatus}</p>
					</div>
				</div>
			</header>

			<div
				className="hide-scrollbar flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5"
				style={{
					backgroundColor: '#0f172a',
					backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
					backgroundSize: '26px 26px'
				}}
			>
				<div className="mx-auto max-w-3xl min-h-full">
					{isLoading && (
						<div className="h-full grid place-items-center text-slate-400 text-sm sm:text-base">
							Loading conversation...
						</div>
					)}

					{!isLoading && !hasPastConversation && (
						<div className="h-full grid place-items-center py-6">
							<div className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 p-5 sm:p-6">
								<h3 className="text-lg font-semibold text-white">Start A New Conversation</h3>
								<p className="text-sm text-slate-400 mt-1">
									No past chats found with this user. Send a message to begin.
								</p>

								<div className="mt-4 space-y-2 text-sm">
									<p>
										<span className="text-slate-400">Name:</span>{' '}
										<span className="text-slate-100 font-medium">{displayName}</span>
									</p>
									<p>
										<span className="text-slate-400">Username:</span>{' '}
										<span className="text-slate-100 font-medium">{selectedUser?.userName || '-'}</span>
									</p>
									<p>
										<span className="text-slate-400">Email:</span>{' '}
										<span className="text-slate-100 font-medium break-all">{selectedUser?.email || '-'}</span>
									</p>
								</div>
							</div>
						</div>
					)}

					{!isLoading && hasPastConversation && (
						<div className="space-y-2 pb-2">
							{messages.map((item, index) => {
								const itemId = item?._id || `${item?.createdAt || ''}-${index}`
								const textMessage = item?.messageContent || item?.message || ''
								const hasImage = Boolean(item?.image)
								const isMine = String(item?.sender) === String(currentUserId)

								if (!textMessage && !hasImage) return null

								return (
									<div key={itemId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
										<div
											className={`max-w-[82%] sm:max-w-[72%] rounded-2xl px-3 py-2 border shadow-sm ${
												isMine
													? 'bg-emerald-700/90 border-emerald-500/60 text-white rounded-br-md'
													: 'bg-slate-800/90 border-slate-700 text-slate-100 rounded-bl-md'
											}`}
										>
											{hasImage && (
												<button
													type="button"
													onClick={() => setViewerImage(item.image)}
													className="mb-2 block rounded-xl overflow-hidden border border-transparent hover:border-emerald-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
													aria-label="Open image"
												>
													<img
														src={item.image}
														alt="Shared media"
														onError={(e) => {
															e.currentTarget.style.display = 'none'
														}}
														className="rounded-xl max-h-60 w-auto object-cover cursor-zoom-in transition hover:opacity-95"
													/>
												</button>
											)}

											{textMessage && (
												<p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
													{textMessage}
												</p>
											)}

											<p
												className={`mt-1 text-[11px] ${
													isMine ? 'text-emerald-100/85' : 'text-slate-400'
												}`}
											>
												{formatMessageTime(item?.createdAt)}
											</p>
										</div>
									</div>
								)
							})}
							<div ref={messageEndRef} />
						</div>
					)}
				</div>
			</div>

			<form onSubmit={handleSendMessage} className="shrink-0 border-t border-slate-800 bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4">
				<div className="mx-auto max-w-3xl">
					{errorText && <p className="text-xs text-rose-300 mb-2">{errorText}</p>}
					<input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						onChange={handleImageSelection}
						className="hidden"
					/>

					{selectedImagePreview && (
						<div className="mb-2 rounded-xl border border-slate-700 bg-slate-900/85 p-2 flex items-center gap-3">
							<img
								src={selectedImagePreview}
								alt="Selected preview"
								className="h-14 w-14 rounded-lg object-cover"
							/>
							<div className="min-w-0 flex-1">
								<p className="text-xs text-slate-300">Image ready to send</p>
								<p className="text-xs text-slate-500 truncate">{selectedImageFile?.name}</p>
							</div>
							<button
								type="button"
								onClick={clearSelectedImage}
								className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 transition grid place-items-center text-slate-200"
								aria-label="Remove selected image"
							>
								<HiXMark className="text-lg" />
							</button>
						</div>
					)}

					<div className="flex items-center gap-2">
						<div className="relative" ref={emojiPickerRef}>
							<button
								type="button"
								onClick={() => setShowEmojiPicker((prev) => !prev)}
								className="h-11 w-11 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition grid place-items-center text-slate-200"
								aria-label="Open emoji picker"
							>
								<HiOutlineFaceSmile className="text-xl" />
							</button>

							{showEmojiPicker && (
								<div className="absolute bottom-14 left-0 z-20 w-60 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-xl">
									<p className="text-xs text-slate-400 mb-2">Quick emojis</p>
									<div className="grid grid-cols-6 gap-1">
										{QUICK_EMOJIS.map((emoji) => (
											<button
												key={emoji}
												type="button"
												onClick={() => handleEmojiSelect(emoji)}
												className="h-8 w-8 rounded-lg hover:bg-slate-800 transition text-lg"
											>
												{emoji}
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="h-11 w-11 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition grid place-items-center text-slate-200"
							aria-label="Attach image"
						>
							<HiOutlinePhoto className="text-xl" />
						</button>

						<input
							type="text"
							value={messageInput}
							onChange={(event) => setMessageInput(event.target.value)}
							placeholder="Type a message"
							disabled={isSending}
							className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
						/>
						<button
							type="submit"
							disabled={(!messageInput.trim() && !selectedImageFile) || isSending}
							className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
								(!messageInput.trim() && !selectedImageFile) || isSending
									? 'bg-slate-700 text-slate-400 cursor-not-allowed'
									: 'bg-emerald-600 text-white hover:bg-emerald-500'
							}`}
						>
							{isSending ? 'Sending...' : 'Send'}
						</button>
					</div>
				</div>
			</form>

			{viewerImage && (
				<div
					className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center"
					onClick={() => setViewerImage('')}
					role="dialog"
					aria-modal="true"
				>
					<div className="relative w-full h-full max-w-6xl flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
						<button
							type="button"
							onClick={() => setViewerImage('')}
							className="absolute top-1 sm:top-3 right-1 sm:right-3 h-10 w-10 rounded-full bg-slate-900/85 border border-slate-700 text-slate-100 hover:bg-slate-800 transition grid place-items-center"
							aria-label="Close image preview"
						>
							<HiXMark className="text-2xl" />
						</button>

						<img
							src={viewerImage}
							alt="Conversation image preview"
							className="max-h-[88vh] max-w-full object-contain rounded-xl border border-slate-700 shadow-2xl"
						/>
					</div>
				</div>
			)}
		</section>
	)
}
