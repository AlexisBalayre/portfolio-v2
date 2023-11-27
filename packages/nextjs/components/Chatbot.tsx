import React, { useEffect, useRef, useState } from "react";

const Chatbot = () => {
  const [prompt, setPrompt] = useState(""); // Prompt to send to the chatbot
  const chatbotScreenRef = useRef(null); // Ref to the chatbot screen

  // Conversation interface
  interface Conversation {
    prompt: string | null;
    response: string;
  }

  // Conversation state
  const [conversation, setConversation] = useState<Conversation[]>([
    {
      prompt: "",
      response: "Hi, I'm Satoshi, the personal assistant of Alexis. <br/> You can ask me anything about him.",
    },
  ]);

  // Scroll to the end of the chat when a new message is added
  useEffect(() => {
    if (chatbotScreenRef.current) {
      (chatbotScreenRef.current as HTMLDivElement).scrollTop = (
        chatbotScreenRef.current as HTMLDivElement
      ).scrollHeight;
    }
  }, [conversation]);

  const sendPrompt = async () => {
    // Validate prompt
    if (!prompt) {
      return;
    }

    // Lock the Chatbot button
    const button = document.getElementById("chatbot_button");
    if (button) {
      button.setAttribute("disabled", "true");
    }

    // Add the prompt to the conversation
    const newConversation = [...conversation];
    newConversation.push({
      prompt,
      response: "",
    });
    setConversation(newConversation);
    setPrompt("");

    // Ask the chatbot for a response
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    // Add the response to the conversation
    newConversation[newConversation.length - 1].response = data.response;
    setConversation(newConversation);

    // Scroll to the end of the chat
    const chatbotScreen = document.getElementById("chatbot_screen");
    if (chatbotScreen) {
      chatbotScreen.scrollTop = chatbotScreen.scrollHeight;
    }

    // Unlock the Chatbot button
    if (button) {
      button.removeAttribute("disabled");
    }
  };

  return (
    <div className="container flex flex-col items-center bg-base-100 rounded-lg shadow-lg mx-auto my-4 p-6 md:w-5/6 ring-offset-white ring-offset-1/2 ring-white/20 ring-1">
      <div className="overflow-y-auto w-full p-4 mb-4 rounded-lg border h-96" ref={chatbotScreenRef}>
        {conversation.map((msg, index) => (
          <div key={index}>
            <div className={`chat chat-end ${msg.prompt ? "" : "hidden"}`}>
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img src="/assets/img/question.png" />
                </div>
              </div>
              <div className="chat-header">You</div>
              <div className="chat-bubble bg-primary text-primary-content">{msg.prompt}</div>
            </div>
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img src="/assets/img/chatbot.png" />
                </div>
              </div>
              <div className="chat-header">Satoshi</div>
              <div
                className={`chat-bubble ${!msg.response ? "hidden" : ""}`}
                dangerouslySetInnerHTML={{ __html: msg.response }}
              ></div>
              <div className={`chat-bubble ${!msg.response ? "" : "hidden"}`}>
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="input input-bordered w-full mb-4"
        placeholder="Ask something here..."
        onSubmit={sendPrompt}
        onKeyDown={e => {
          if (e.key === "Enter") {
            sendPrompt();
          }
        }}
      />
      <button onClick={sendPrompt} className="btn btn-primary w-full" id="chatbot_button">
        Send
      </button>
    </div>
  );
};

export default Chatbot;
