import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import ViteExpress from "vite-express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 사용자와 연결됐을 때,
io.on("connection", (client) => {
    const connectedClient = client.handshake.query.username;

    console.log(`사용자가 접속했습니다. ${connectedClient}`);

    // 사용자 접속 msg 전달
    client.broadcast.emit("message", {
      username: "관리자",
      message: `${connectedClient} 님이 방에 들어왔습니다.`,
    });

    // 클라이언트에서 전송한 msg 받기
    client.on("message", (response) => {
      console.log(`보낸 사람: ${response.username}, 보낸 메세지: ${response.userInput}`);

      // 서버에서 클라이언트로 msg 보내기 - 응답
      io.emit("message", {
        username: response.username,
        message: response.userInput,
      });
    });


    // 사용자 접속 종료
  client.on("disconnect", () => {
    console.log(`사용자가 접속 종료했습니다. ${connectedClient}`);
    
    io.emit("message", {
      username: "관리자",
      message: `${connectedClient} 님이 방에 나갔습니다.`,
    });
  });
});

server.listen(3000, () => {
  console.log("Listening the server, port: 3000");
});

ViteExpress.bind(app, server);
