import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import "./App.css";

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userInput, setUserinput] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  const messageList = messages.map((aMsg, idx) => (
    <li key={idx}>
      {aMsg.username} : {aMsg.message}
    </li>
  ));

  // Chat 서버 접속 함수
  const connectToChatServer = () => {
    console.log("connectToChatServer");

    const _socket = io("http://localhost:3000/", {
      autoConnect: false,
      query: {
        username,
      },
    });
    _socket.connect();

    setSocket(_socket);
  };

  // Chat 서버 접속 종료 함수
  const disconnectToChatServer = () => {
    console.log("disconnectToChatServer");
    socket?.disconnect();
  };

  // 프론트에서 접속한 것을 확인하기 위해 사욜하는 함수
  const onConnected = () => {
    console.log("프론트 onConnected");
    setIsConnected(true);
  };

  // 프론트에서 접속 종료한 것을 확인하기 위해 사욜하는 함수
  const onDisConnected = () => {
    console.log("프론트 - onDisConnected");
    setIsConnected(false);
  };

  // 서버로 입력한 message 보내기
  // msg만 보낼수도 있고,
  // json 형태로 다양한 msg를 한번에 보낼수도 있음
  const sendMessageToChatServer = () => {
    console.log(`프론트 - sendMessageToChatServer input: ${userInput}`);

    socket?.emit(
      "message",
      { username: username, userInput: userInput },
      (response) => {
        console.log(response);
      }
    );
  };

  const onMessageReceived = (msg) => {
    console.log("프론트 - onMessageReceived");
    console.log(msg);

    setMessages((prev) => [...prev, msg]);
  };


  // msg 추가할 때마다 scroll 올리기
useEffect(() => {
  window.scrollTo({
    top: document.body.scrollHeight,
    left: 0,
    behavior: "smooth", 
  });
}, [messages]);


  // socket 값이 렌더링 될때마다 useEffect hook 호출
  // 프론트가 접속 했을때와 접속 종료 했을때를 확인하기 위해 사용
  useEffect(() => {
    // 이벤트 핸들러 생성
    socket?.on("connect", onConnected);
    socket?.on("disconnect", onDisConnected);
    socket?.on("message", onMessageReceived);

    return () => {
      // 이벤트 핸들러 삭제
      socket?.off("connect", onConnected);
      socket?.off("disconnect", onDisConnected);
      socket?.off("message", onMessageReceived);
    };
  }, [socket]);

  return (
    <>
      <div className="navbar">
        <h1>유저 : {username}</h1>
        <h2>현재 접속 상태: {isConnected ? "접속 중" : "미접속"}</h2>
        <div className="card">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => connectToChatServer()}>접속</button>
          <button onClick={() => disconnectToChatServer()}>접속 종료</button>
        </div>
      </div>

      <ul className="chatList">{messageList}</ul>

      <div className="messageInput">
        <input
          value={userInput}
          onChange={(e) => setUserinput(e.target.value)}
        />
        <button type="submit" onClick={() => sendMessageToChatServer()}>보내기</button>
      </div>
    </>
  );
}

export default App;
