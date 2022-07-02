module.exports = (io, socket) => {
    // 指定された部屋に入室するエンドポイント
    // クライアントからは '{"roomId": "${部屋名}"}' というデータが渡されることを想定
    // 入室時クライアントには一律で"誰かが入室しました"というメッセージを送信する
    const enterRoom = (data) => {
        roomId = data.roomId;
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('server:message:send', "誰かが入室しました");
    }

    // 同じ部屋に入室しているユーザに対してメッセージを送信するエンドポイント
    // クライアントからは '{"roomId": "${部屋名}", "message": "${送信メッセージ}"}' というデータが渡されることを想定
    // クライアントには送信元のユーザが入力したメッセージがそのまま送信される
    const sendMessage = (data) => {
        socket.broadcast.to(data.roomId).emit('server:message:send', data.message);
    }

    // ハンドラの登録
    // https://socket.io/docs/v4/server-application-structure/
    socket.on("room:enter", enterRoom);
    socket.on("client:message:send", sendMessage);
}