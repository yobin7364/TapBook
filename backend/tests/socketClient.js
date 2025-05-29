// backend/test/socketClient.js
import { io } from 'socket.io-client'

// 1) Change this to the ID of the user you want to test reminders for:
const USER_ID = '68328c18b484141b59ebfa55'

// 2) Connect to your running server:
const socket = io('http://localhost:4000')

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO as', socket.id)
  // 3) Register this socket under that userId room:
  socket.emit('register', USER_ID)
  console.log('👤 Registered socket under userId:', USER_ID)
})

// 4) Listen for the appointmentReminder event:
socket.on('appointmentReminder', (payload) => {
  console.log('🔔 Received appointmentReminder event:')
  console.dir(payload, { depth: null })
  // e.g. { appointmentId, serviceTitle, scheduledAt }
})

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server')
})
