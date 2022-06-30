const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const projectListRoomName = 'projectList';

app.use(express.json());

// 初回接続時のルーティング
app.get('/', (req, res) => {
  req.body
  res.sendFile(__dirname + '/index.html');
});

// 案件が追加された場合にコールされるエンドポイント.
// 案件一覧(projectList)部屋と案件詳細($projectId)の部屋に通知を行う
// クライアントからは '{"projectId": ${案件ID}, "message": "${メッセージ}"}' というデータが渡されることを想定
app.post('/message', (req, res) => {
  res.send('Got a POST request');
  roomId = req.body.roomId;
  io.emit('server_to_client', req.body)
  // socket.broadcast.to(projectListRoomName).emit('server_to_client', {value : req.body.updateType});
  // socket.broadcast.to(roomId).emit('server_to_client', {value : req.body.updateType});
})

// WebSocket の処理
io.on('connection', (socket) => {
  // 初回接続時にクライアントに送信?
  // socket.broadcast.emit('chat message', 'hello, world!');

  // Liff から渡された部屋名に入室する
  // Liff からは '{"value": "${部屋名}"}' というデータが渡されることを想定
  socket.on('enter_room', function(data) {
    room = data.value;
    socket.join(room);
  });

  socket.on('client_to_server', (msg) => {
    io.emit('server_to_client', msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});