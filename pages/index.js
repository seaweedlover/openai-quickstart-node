import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: userInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
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
        <div className={styles.input}>{userInput}</div>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
