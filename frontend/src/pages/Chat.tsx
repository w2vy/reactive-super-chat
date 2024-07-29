import React from "react";
import Alert from '@mui/material/Alert';
import { useState, useEffect, useRef } from 'react';
import InputEmoji from 'react-input-emoji'; 
import {isMobile} from 'react-device-detect';
import { CypherChat, AddressBook, Identity, Service } from 'cypherchat';
import ChatProps from "../ChatProps";

//const soundAlert = require("../sounds/alert.mp3");
// declaring an mp3 file did not help, I solve the problem as best I can :)

//const CypherChat = require('cypherchat');
let chat = new CypherChat();

let myid : Identity;
let mySession: string;

const Chat: React.FC<ChatProps> = ({ socket }) => {
  const [inputValue, setInputValue] = useState("");
  const [countData, setCount] = useState("");
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ id: number, nickname: string; message: string }[]>([]);
  const nextId = useRef(1);

React.useEffect(() => {
    //const socket = socketIOClient(FCServer);
    if (!socket.connected) {
      console.log("connecting...");
      socket.connect();
    }

    socket.on("connect", () => {
      //const audio = new Audio(soundAlert);
      //audio.play();
      console.log("Connected")
      let identity = localStorage.getItem("identity");
      if (identity !== null) {
        try {
          myid = AddressBook.importIdentity(identity);
          console.log(`myid is ${myid}`);
          chat = new CypherChat();
          // Set up basic requirements
          chat.setOriginator(myid.Address);
          chat.setPrivateKey(myid.PrivateKey);
          chat.setAddressBook(myid.ABook);
          // For now default to the public Shout channel
          let nadr = chat.getAddressBook().findNameAddress("Shout");
          if (nadr.adr !== null) chat.setRecipient(nadr.adr);
          else console.log("Recipient not set");
          console.log(`setup Recipient ${chat.getRecipient()} ${nadr.adr}`);
          chat.setEncoding("TEXT");
          //chat.setEncryption("RSA2048");
          chat.setSignatureMethod("RSA2048");
        } catch(error) {
          console.log(error);
        }
      }
    });
  
    socket.on("clientMessage", (data) => {
      console.log(`clientMessage ${socket.id}`);
      let chat_msg = chat.clone();
      chat_msg.setVerbose(true);
      console.log("try decodeParcel");
      let isValid = chat_msg.decodeParcel(data);
      console.log(`Message isValid? ${isValid}`);
      console.log(`Service: ${chat_msg.getService()}`);
      if (chat_msg.getService() === undefined) { // We have a user message
        let name = '(Unknown)';
        let message = chat_msg.decryptMessage(chat_msg.getContent());
        console.log('decoded Parcel');
        let orig = chat_msg.getAddressBook().findNameAddress(chat_msg.getOriginator());
        if (orig.name !== null) name = orig.name;
        addMessage(name, message);
        console.log(`added message ${name}: ${message}`);
      } else { // We have a service message
        if (chat_msg.getService() === Service.NEW_SESSION) {
          mySession = chat_msg.getContent();
          console.log(`New Session: ${mySession}`);
          // send Listen for my address and all channels
          console.log(`Listen ${myid}`);
          let msg = chat.encodeListenFor(myid.Address, myid.PublicKey, myid.PrivateKey, mySession);
          socket.emit("serverMessage", msg)
          let msgs = chat.channelsListenFor(chat.getAddressBook().getChannels(), mySession);
          console.log(msgs);
          for (msg in msgs) {
            socket.emit("serverMessage", msgs[msg]);
          }
        }
      }
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
    //const socket = socketIOClient(FCServer);
    const nickname = localStorage.getItem("nickname") || '{}';
    //addMessage(`(${nickname})`, inputValue)
    //socket.emit("new_message", {nickname: nickname, message: inputValue});
    console.log(`handleSubmit: Recipient ${chat.getRecipient()}`);
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
          <input className="input_chat" type="text" placeholder="Message" disabled/>
          <p className="users_paragraph">Users on the site - {countData}</p>
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
        <p className="users_paragraph">Users on the site - {countData}</p>
      </div>
        


    }
  };
  const checkNameEmpty = () => {
    if (!localStorage.hasOwnProperty('nickname') || localStorage.length === 0) {
      return <Alert variant="outlined" severity="error">You haven't entered a nickname!</Alert>
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

export default Chat;