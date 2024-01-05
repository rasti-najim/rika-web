import React, { useState, useEffect } from "react";
import styled from "styled-components";
import RecordRTC from "recordrtc";

import socket from "./socket";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function AudioRecorder() {
  const [recordRTC, setRecordRTC] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); // URL for the WAV file

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream); // Store the stream in state

      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
      });
      recorder.startRecording();
      setRecordRTC(recorder);
    } catch (error) {
      console.error("Error accessing the microphone:", error);
    }
  };

  const stopRecording = () => {
    if (recordRTC) {
      recordRTC.stopRecording(() => {
        const blob = recordRTC.getBlob();
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
        console.log(audioUrl); // URL for the WAV file

        // Release resources
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }

        if (blob instanceof Blob) {
          sendAudio(blob);
        } else {
          console.error("The recorded audio is not a Blob:", blob);
        }
      });
    }
  };

  async function sendAudio(blob) {
    const formData = new FormData();
    formData.append("audioFile", blob, "audio.mp3");
    console.log(formData);

    const response = await fetch("http://localhost:8080/audio", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);
  }

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <audio src={audioUrl} controls></audio>
    </div>
  );
}

function ChatInterface() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [conversation, setConversation] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receive_message", async (data) => {
      console.log(data);
      if (data.role === "tool") {
        console.log("sending tool message");

        let date = new Date();
        let dateString = date.toISOString().replace("T", " ").substring(0, 19);

        socket.emit("send_message", { message: data, time: dateString });
      } else {
        const aiMessage = {
          text: data.choices[0].message.content,
          sender: "ai",
        };
        setConversation((conversation) => [...conversation, aiMessage]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     // Standard message for the browser - the custom message won't be shown
  //     event.preventDefault();
  //     event.returnValue = ""; // Required for some browsers

  //     // Attempt to perform an asynchronous operation
  //     sendMessage(
  //       "Warning: the conversation history will soon reach its maximum length and be trimmed. Make sure to save any important information from the conversation to your memory before it is removed."
  //     ).catch((err) => {
  //       console.error("Error sending message:", err);
  //     });

  //     // Note: The sendMessage call is not guaranteed to complete
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userMessage = { text: message, sender: "user" };
    setConversation([...conversation, userMessage]);
    // socket.emit("send_message", userMessage);
    sendMessage(message);
    // const data = await sendMessage(message);
    // const aiMessage = { text: data.choices[0].message.content, sender: "ai" };
    // setConversation([...conversation, userMessage, aiMessage]);
    setMessage("");
  };

  const handleWarningClick = async () => {
    console.log(
      "Warning: the conversation history will soon reach its maximum length and be trimmed. Make sure to save any important information from the conversation to your memory before it is removed."
    );
    // socket.emit(
    //   "send_message",
    //   "Warning: the conversation history will soon reach its maximum length and be trimmed. Make sure to save any important information from the conversation to your memory before it is removed."
    // );
    sendMessage(
      "Warning: the conversation history will soon reach its maximum length and be trimmed. Make sure to save any important information from the conversation to your memory before it is removed."
    );
  };

  function functionCalling(name) {
    console.log("Hello" + name);
    return "Hello" + name;
  }

  function getTimeOfDay() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const timeOfDay = "AM";
    if (hours > 12) {
      hours = hours - 12;
      timeOfDay = "PM";
    }
    return hours + ":" + minutes + ":" + seconds + " " + timeOfDay;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function timeout(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    );
  }

  function sendMessage(message) {
    let date = new Date();
    let dateString = date.toISOString().replace("T", " ").substring(0, 19);
    const userMessage = { role: "user", content: message };
    socket.emit("send_message", { message: userMessage, time: dateString });
    // try {
    //   console.log(message);
    //   console.log(conversation);
    //   console.log(messages);
    //   let date = new Date();
    //   let dateString = date.toISOString().replace("T", " ").substring(0, 19);
    //   const userMessage = { role: "user", content: message };
    //   let response = await fetch("http://localhost:8080/chat", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ message: userMessage, time: dateString }),
    //   });

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
    //   let data = await response.json();
    //   console.log(data);

    //   if (data.role === "tool") {
    //     console.log("sending tool message");

    //     // Introduce a delay
    //     await delay(1000); // Delay for 1 second

    //     let date = new Date();
    //     let dateString = date.toISOString().replace("T", " ").substring(0, 19);

    //     response = await fetch("http://localhost:8080/chat", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ message: data, time: dateString }),
    //     });

    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     data = await response.json();
    //   }

    //   return data;
    // } catch (error) {
    //   console.error("Error in sendMessage:", error);
    // }
  }

  return (
    <div className="chat-interface">
      <ChatContainer>
        {conversation.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender}>
            {msg.text}
          </MessageBubble>
        ))}
      </ChatContainer>
      <form onSubmit={handleSubmit}>
        <InputContainer>
          <TextField
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type your message here..."
          />
          <SendButton type="submit">Send</SendButton>
        </InputContainer>
      </form>

      <AudioRecorder />
      <WarningButton onClick={handleWarningClick}>System Warning</WarningButton>
    </div>
  );
}

const ChatContainer = styled.div`
  position: relative;
  padding: 20px;
  height: 400px;
  overflow-y: auto;
`;

const InputContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  display: flex;
  justify-content: space-between;
`;

const TextField = styled.input`
  flex: 1;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px;
`;

const MessageBubble = styled.div`
  max-width: 60%;
  margin-bottom: 10px;
  color: ${(props) => (props.sender === "user" ? "#fff" : "#000")};
  line-height: 1.6;
  font-family: "Arial", sans-serif;
  padding: 10px;
  border-radius: 5px;
  background-color: ${(props) =>
    props.sender === "user" ? "blue" : "#f5f5f5"};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  align-self: ${(props) =>
    props.sender === "user" ? "flex-end" : "flex-start"};
`;

const WarningButton = styled.button`
  background-color: #ffcc00;
  color: #000;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
`;

// Usage
<WarningButton>System Warning</WarningButton>;

export default ChatInterface;
