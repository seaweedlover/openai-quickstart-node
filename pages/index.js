import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import ChatConversation from "./components/ChatConversation";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();
  const [chatHistory, setChatHistory] = useState([]);
  const [relationship, setRelationship] = useState("");
  const [personality, setPersonality] = useState("");

  const systemMsg = `You are an assistant to provide grief and emotional support to users who have lost their families or friends. 
In the following conversation, you should speak like users' ${relationship} in a ${personality}, and natural way. 
Please don't mention you are a language model or AI in any of your responses.`;

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: userInput, contextMessages: chatHistory, systemMessage: systemMsg }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(data.result);
      updateChatHistory(userInput, data.result);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  function getPersonalityQuestion() {
    return `How was your ${relationship} like?`;
  }

  function updateChatHistory(input, result) {
    let newChatHistory = [...chatHistory, {'role': 'user', content: input}, {'role': 'assistant', content: result}];
    setChatHistory(newChatHistory);
  }

  return (
    <div>
      <Head>
        <title>Grief Support Chatbot</title>
        <link rel="icon" href="./hug-icon.webp" />
      </Head>

      <main className={styles.main}>
        <img src="./hug-icon.webp" className={styles.icon} />
        <h3>Grief Support Chatbot</h3>
        <input
          type="text"
          name="relationship"
          placeholder="Who do you want to talk to today?"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
        />
        <input
          type="text"
          name="personality"
          placeholder={getPersonalityQuestion()}
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
        />
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="userMsg"
            placeholder="Enter what you want to say here"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>
        <div>
          <ChatConversation messages={chatHistory} relationship={relationship}/>
        </div>
      </main>
    </div>
  );
}
