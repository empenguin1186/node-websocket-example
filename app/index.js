const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const handlers = require("./handler");

const projectListRoomName = 'projectList';

const io = new Server(server);
const onConnection = (socket) => {
  handlers(io, socket);
}
io.on("connection", onConnection);

app.use(express.json());

app.get('/', (req, res) => {
  req.body
  res.sendFile(__dirname + '/index.html');
});

// 案件が追加された場合にコールされるエンドポイント.
// 案件一覧(projectList)部屋と案件詳細($roomId)の部屋に通知を行う
// クライアントからは '{"roomId": ${部屋名}, "updateType": "${更新タイプ}"}' というデータが渡されることを想定
app.post('/message', (req, res) => {
  res.send('Got a POST request');
  roomId = req.body.roomId;
  io.to(roomId).to(projectListRoomName).emit('server:message:send', `{updateType: ${req.body.updateType}}`);
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});