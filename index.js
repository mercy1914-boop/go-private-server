const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

const BOARD_SIZE = 19
function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
}

const rooms = {}

io.on('connection', (socket) => {
  console.log('연결됨:', socket.id)

  socket.on('createRoom', () => {
    const id = Math.random().toString(36).substring(2, 8)
    rooms[id] = { board: createEmptyBoard(), turn: 1 }
    socket.join(id)
    socket.emit('joined', { room: id, color: 1, board: rooms[id].board, turn: 1 })
  })

  socket.on('joinRoom', ({ room }) => {
    const r = rooms[room]
    if (!r) return socket.emit('errorMessage', '존재하지 않는 방입니다.')
    socket.join(room)
    socket.emit('joined', { room, color: 2, board: r.board, turn: r.turn })
  })

  socket.on('play', ({ room, x, y }) => {
    const r = rooms[room]
    if (!r) return
    if (r.board[x][y] !== 0) return
    const color = r.turn
    r.board[x][y] = color
    r.turn = color === 1 ? 2 : 1
    io.to(room).emit('update', { board: r.board, turn: r.turn })
  })
})

server.listen(3000, () => console.log('서버 실행 중: http://localhost:3000'))