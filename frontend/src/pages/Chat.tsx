import Alert from '@mui/material/Alert';
import { useState, useEffect, useRef } from 'react';
import socketIOClient from "socket.io-client";
//import CypherChat from 'cypherchat';

//import useTransition from '../hooks/useTranslate';
import InputEmoji from 'react-input-emoji';
import {isMobile} from 'react-device-detect';
import { CypherChat, AddressBook, FluxChatAddress } from 'cypherchat';
//import { CypherChat } from 'cypherchat';

const soundAlert = require("../sounds/alert.mp3");
// declaring an mp3 file did not help, I solve the problem as best I can :)

//const CypherChat = require('cypherchat');
let chat = new CypherChat();

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [countData, setCount] = useState("");
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ id: number, nickname: string; message: string }[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    const socket = socketIOClient("http://127.0.0.1:5000");
    socket.on("connect", () => {
      const audio = new Audio(soundAlert);
      audio.play();
      console.log("Connected")
      let identity = localStorage.getItem("identity");
      if (identity !== null) {
        var myid;
        try {
          myid = AddressBook.importIdentity(identity);
        } catch(error) {
          console.log(error);
          myid = null;
        }
        if (myid !== null) {
          chat = new CypherChat();
          // Set up basic requirements
          chat.setOriginator(myid.Address);
          chat.setPrivateKey(myid.PrivateKey);
          chat.setAddressBook(myid.ABook);
          // For now default to the public Shout channel
          let nadr = chat.getAddressBook().findNameAddress("Shout");
          if (nadr.adr !== null) chat.setRecipient(nadr.adr);
          else console.log("Recipient not set");
          chat.setEncoding("TEXT");
          //chat.setEncryption("RSA2048");
          chat.setSignatureMethod("RSA2048");
          // send Listen for my address and all channels
          let msg = chat.encodeListenFor(myid.Address, myid.PublicKey, myid.PrivateKey);
          socket.emit("serverMessage", msg)
          let msgs = chat.channelsListenFor(chat.getAddressBook().getChannels());
          console.log(msgs);
          for (msg in msgs) {
            socket.emit("serverMessage", msgs[msg]);
          }
        }
      }
    });
  
    socket.emit("request_data", { nickname: localStorage.getItem("nickname") });
    socket.on("request_data", (data) => {
      setCount(data.count);
    });
  
    socket.on("new_message", (data) => {
      console.log("added message");
      setMessages(data);
    });

    socket.on("clientMessage", (data) => {
      console.log("clientMessage");
      let chat_msg = chat.clone();
      console.log("try decodeParcel");
      let isValid = chat_msg.decodeParcel(data);
      console.log(`Message isValid? ${isValid}`);
      let name = '(Unknown)';
      let message = chat_msg.decryptMessage(chat_msg.getContent());
      console.log('docoded Parcel');
      let orig = chat_msg.getAddressBook().findNameAddress(chat_msg.getOriginator());
      if (orig.name !== null) name = orig.name;
      addMessage(name, message);
      console.log(`added message ${name}: ${message}`);
      //setMessages(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected event");
      socket.disconnect();
    });
  
    return () => {
      console.log('disconnect requested')
      socket.disconnect();
    };
  }, []);

  const addMessage = (nickname: string, message: string) => {
    console.log(`addMessage: ${message}`)
      setMessages(prevMessages => [...prevMessages, { id: nextId.current++, nickname, message }]);
  };
  const handleKeyDown = (event: { key: string; }) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };
  // const textProps = { text: "Пример текста для перевода" };
  // const text = await useTransition(textProps);

  const settingThemeChat = () => {
    const themeChat = localStorage.getItem("theme");
    if (themeChat) {
      if (themeChat === "theme_card_dark") {
        return {'backgroundColor': '#000000','backgroundColor2': '#050505'}

      } else if (themeChat === "theme_card_light") {
        return {'backgroundColor': '#ffffff','backgroundColor2': '#e6e6e6'}

      } else {
        return {'backgroundColor': '#35487a','backgroundColor2': '#2f406d'}
      }
    }
    return {'backgroundColor': '#35487a','backgroundColor2': '#2f406d'}
  }

  const handleSubmit = () => {
    const socket = socketIOClient("http://127.0.0.1:5000");
    const nickname = localStorage.getItem("nickname") || '{}';
    addMessage(nickname, inputValue)
    socket.emit("new_message", {nickname: nickname, message: inputValue});
    chat.setMessage(inputValue);
    let msg = chat.encodeParcel();
    console.log(`serverMessage ${msg}`);
    socket.emit("serverMessage", msg);
    setInputValue("")
  };
  const messagesComponent = messages.slice(isMobile ? -15:-18).map((message, index) => {
    return (
      <div key={index} className="message_card" style={index % 2 === 0 && index !== 0 ? 
      {'backgroundColor': settingThemeChat()['backgroundColor']}:{'backgroundColor': settingThemeChat()['backgroundColor2']}} ref={scrollDivRef}>
        <p className="message_paragraph" style={settingThemeChat()['backgroundColor'] === '#ffffff' ? {"color":"black"}:{}}>{message.nickname}: {message.message}</p>
      </div>
    );
  });

  const chatComponent = () => {
    if (!localStorage.hasOwnProperty('nickname') || localStorage.length === 0) {
      return (
        <div>
          <input className="input_chat" type="text" placeholder="Сообщение" disabled/>
          <p className="users_paragraph">Пользователей на сайте - {countData}</p>
        </div>
      );
    } else {
      return <div>
        <br/>
        <InputEmoji
        value={inputValue}
        onChange={setInputValue}
        onEnter={(text: string) => setInputValue(text)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        />
        <p className="users_paragraph">Пользователей на сайте - {countData}</p>
      </div>
        


    }
  };
  const checkNameEmpty = () => {
    if (!localStorage.hasOwnProperty('nickname') || localStorage.length === 0) {
      return <Alert variant="outlined" severity="error">Вы не ввели никнейм!</Alert>
    }

  }
  return <div>
    <div>
      {messagesComponent}
    </div>
    {checkNameEmpty()}
    {chatComponent()}
  </div>
}