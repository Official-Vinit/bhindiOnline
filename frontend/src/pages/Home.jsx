import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import MessageArea from '../components/MessageArea'
import SideBar from '../components/SideBar'

export default function Home() {
  const { otherUsers, selectedUser, userData } = useSelector((state) => state.user)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)

  const chatUsers = useMemo(() => {
    const users = Array.isArray(otherUsers) ? otherUsers : []
    if (!userData) return users

    const normalize = (value) => String(value || '').trim().toLowerCase()
    const currentUserId = String(userData?._id || '')
    const currentUserEmail = normalize(userData?.email)
    const currentUserName = normalize(userData?.userName)

    return users.filter((user) => {
      if (!user) return false

      const sameId = currentUserId && String(user?._id || '') === currentUserId
      const sameEmail = currentUserEmail && normalize(user?.email) === currentUserEmail
      const sameUserName = currentUserName && normalize(user?.userName) === currentUserName

      return !sameId && !sameEmail && !sameUserName
    })
  }, [otherUsers, userData])

  useEffect(() => {
    if (!selectedUser && isMobileChatOpen) {
      setIsMobileChatOpen(false)
    }
  }, [isMobileChatOpen, selectedUser])

  function handleSelectChat() {
    setIsMobileChatOpen(true)
  }

  function handleBackToList() {
    setIsMobileChatOpen(false)
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      <div className="h-full w-full min-h-0 lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className={`${isMobileChatOpen ? 'hidden' : 'block'} h-full min-h-0 lg:block`}>
          <SideBar
            conversations={chatUsers}
            onSelectChat={handleSelectChat}
          />
        </div>

        <div className={`${isMobileChatOpen ? 'block' : 'hidden'} h-full min-h-0 min-w-0 lg:block`}>
          <MessageArea
            showBackButton={isMobileChatOpen}
            onBack={handleBackToList}
          />
        </div>
      </div>
    </div>
  )
}
