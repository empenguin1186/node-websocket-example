const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.json());

// 初回接続時のルーティング
app.get('/', (req, res) => {
  req.body
  res.sendFile(__dirname + '/index.html');
});

// 通知APIのルーティング
app.post('/message', (req, res) => {
  res.send('Got a POST request');
  io.emit('chat message', 'data: ' + req.body.data);
})

// WebSocket の処理
io.on('connection', (socket) => {
  // 初回接続時にクライアントに送信?
  // socket.broadcast.emit('chat message', 'hello, world!');

  console.log(socket.id);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});