const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// load env config
dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const myEmitter = require('./src/events/eventEmitter');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const PORT = process.env.PORT || 5050;

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', msg: 'server is running' });
});

// socket.io chat
io.on('connection', (socket) => {
  console.log('user connected: ' + socket.id);

  // join room
  socket.on('join_room', (data) => {
    socket.join(data.room);
    socket.username = data.username || 'User';
    socket.room = data.room;

    console.log(`${socket.username} joined room: ${data.room}`);

    socket.to(data.room).emit('system_message', {
      text: `${socket.username} joined the chat`
    });

    socket.emit('system_message', {
      text: `You joined room: ${data.room}`
    });
  });

  // receive and send message
  socket.on('send_message', (data) => {
    const chatData = {
      user: data.sender || socket.username || 'User',
      text: data.message,
      room: data.room || socket.room || 'general',
      time: new Date().toLocaleTimeString()
    };

    io.to(chatData.room).emit('receive_message', chatData);

    // emit to event emitter
    myEmitter.emit('chatMessage', chatData);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    if (socket.room) {
      socket.to(socket.room).emit('system_message', {
        text: `${socket.username || 'A user'} left the room`
      });
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = { app, server, io };
