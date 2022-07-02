const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  // wscat 実行時(wscat -c ws://localhost:3000/socket.io/\?transport=websocket)に発生したエラー 「error: Invalid WebSocket frame: RSV1 must be clear」の対応
  // https://github.com/websockets/ws/issues/1140
  // https://socket.io/docs/v4/server-options/#permessagedeflate
  // httpCompression: {
  //   // Engine.IO options
  //   threshold: 2048, // defaults to 1024
  //   // Node.js zlib options
  //   chunkSize: 8 * 1024, // defaults to 16 * 1024
  //   windowBits: 14, // defaults to 15
  //   memLevel: 7, // defaults to 8
  // }
  perMessageDeflate: {
    threshold: 2048, // defaults to 1024

    zlibDeflateOptions: {
      chunkSize: 8 * 1024, // defaults to 16 * 1024
    },

    zlibInflateOptions: {
      windowBits: 14, // defaults to 15
      memLevel: 7, // defaults to 8
    },

    clientNoContextTakeover: true, // defaults to negotiated value.
    serverNoContextTakeover: true, // defaults to negotiated value.
    serverMaxWindowBits: 10, // defaults to negotiated value.

    concurrencyLimit: 20, // defaults to 10
  }
});
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
  io.to(roomId).to(projectListRoomName).emit('server_to_client', "案件が追加されました");
})

// WebSocket の処理
io.on('connection', (socket) => {
  // Liff から渡された部屋名に入室する
  // Liff からは '{"value": "${部屋名}"}' というデータが渡されることを想定
  socket.on('enter_room', function(data) {
    room = data.value;
    socket.join(room);
    socket.broadcast.to(room).emit('server_to_client', "誰かが入室しました");
  });

  socket.on('client_to_server', (msg) => {
    io.emit('server_to_client', msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});