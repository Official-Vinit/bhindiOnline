import { io } from 'socket.io-client'
import { serverurl } from './api'

let socketInstance = null
let activeUserId = null

export const connectSocket = (userId) => {
	if (!userId) return null

	const normalizedUserId = String(userId)

	if (socketInstance && activeUserId === normalizedUserId) {
		if (!socketInstance.connected) {
			socketInstance.connect()
		}
		return socketInstance
	}

	if (socketInstance) {
		socketInstance.disconnect()
		socketInstance = null
	}

	activeUserId = normalizedUserId
	socketInstance = io(serverurl, {
		query: {
			userId: normalizedUserId
		},
		withCredentials: true
	})

	return socketInstance
}

export const getSocket = () => socketInstance

export const disconnectSocket = () => {
	if (socketInstance) {
		socketInstance.disconnect()
		socketInstance = null
	}
	activeUserId = null
}
