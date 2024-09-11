import React from "react";
import Alert from '@mui/material/Alert';
import { useState, useEffect, useRef } from 'react';
import InputEmoji from 'react-input-emoji'; 
import {isMobile} from 'react-device-detect';
import ChatProps from "../ChatProps";

const Chat: React.FC<ChatProps> = ({ fluxchat }) => {
  const [inputValue, setInputValue] = useState("");
  const [countData, setCount] = useState("");
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ id: number, nickname: string; message: string }[]>([]);
  const nextId = useRef(1);
  const myContacts: {[key: string]: string} = fluxchat.getContacts();
  const lschatto =  localStorage.getItem("chatto");
  const chatto: string = lschatto === null ? "Shout" : lschatto;
  const [selectedName, setSelectedName] = useState<string>(chatto);
  
  const addMessage = (nickname: string, message: string) => {
    console.log(`addMessage: ${message}`);
    setMessages(prevMessages => [...prevMessages, { id: nextId.current++, nickname, message }]);
  };

  const handleKeyDown = (event: { key: string; }) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

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

  function display_message(address:string, valid:boolean, message:string): void {
    let name = address;
    if (address in myContacts) name = myContacts[address];
    console.log(`display_message: isValid ${valid} ${name}: ${message}`);
    addMessage(`${name}`, `[${valid}] ${message}`);
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedName(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedName !== null) {
      localStorage.setItem("chatto", selectedName);
      addMessage(`(You)`, inputValue)
      if (!fluxchat.hasChat(selectedName)) fluxchat.createChat(selectedName, display_message);
      fluxchat.sendChatMessage(selectedName, inputValue);
    }
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
      return <div  style={{ fontSize: '16px' }}>
        <br/>
        <InputEmoji
        value={inputValue}
        onChange={setInputValue}
        onEnter={(text: string) => setInputValue(text)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        />
        <select
            id="Select"
            value={selectedName}
            onChange={handleSelectChange}
          >
            {Object.entries(myContacts).map(([key, value]) => (
              <option
                key={key}
                value={value}
                defaultValue={selectedName}
              >
                {value}
              </option>
            ))}
        </select>
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