import { useState, useEffect, useRef } from 'react';
import socketIOClient from "socket.io-client";


export default function Chat() {
  const [inputValue, setInputValue] = useState("Сообщение");
  const [countData, setCount] = useState("");
  const [messages, setMessages] = useState<{ id: number, nickname: string; message: string }[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    const socket = socketIOClient("http://127.0.0.1:5000");
    socket.on("connect", () => {
      console.log("Connected")
    });
  
    socket.emit("request_data", { nickname: localStorage.getItem("nickname") });
    socket.on("request_data", (data) => {
      setCount(data.count);
    });
  
    socket.on("new_message", (data) => {
      console.log("added message");
      setMessages(data);
    });
  
    socket.on("disconnect", () => {
      console.log("Disconnected");
      socket.disconnect();
    });
  
    return () => {
      socket.disconnect();
    };
  }, []);

  const addMessage = (nickname: string, message: string) => {
      setMessages(prevMessages => [...prevMessages, { id: nextId.current++, nickname, message }]);
  };
  const handleKeyDown = (event: { key: string; }) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const socket = socketIOClient("http://127.0.0.1:5000");
    const nickname = localStorage.getItem("nickname") || '{}';
    addMessage(nickname, inputValue)
    socket.emit("new_message", {nickname: nickname, message: inputValue});
    setInputValue("");
  };

  const messagesComponent = messages.map((message) => {
    return (
      <div key={message.id}>
        <p className="message_paragraph">{message.nickname}: {message.message}</p>
      </div>
    );
  });

  const chatComponent = () => {
    return (
      <div>
        <input className="input_chat" type="text" value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyDown={handleKeyDown}/>
        <p className="users_paragraph">Пользователей на сайте - {countData}</p>
      </div>
    );
  };
  const checkNameEmpty = () => {
    if (!localStorage.hasOwnProperty('nickname')) {
      return <div>
        <p className="message_paragraph">Вы не ввели никнейм!</p>
      </div>
    }

  }
  return <div>
    {checkNameEmpty()}
    {checkNameEmpty() ? null:chatComponent()}
    {messagesComponent}
  </div>
}