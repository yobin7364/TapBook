import { Server } from 'socket.io'

let io

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }, // adjust to your front-end origin
  })

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id)

    // client will emit "register" with their userId
    socket.on('register', (userId) => {
      console.log(`👤 Register socket ${socket.id} to room ${userId}`)
      socket.join(userId)
    })

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id)
    })
  })

  return io
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized!')
  return io
}
