import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function ChatBox({ chatId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      sender: user.uid,
      text,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="border rounded-lg p-3 bg-white dark:bg-gray-800">
      <h3 className="font-bold mb-2">Chat</h3>
      <div className="h-60 overflow-y-auto space-y-2 mb-2">
        {messages.map((m, i) => (
          <p
            key={i}
            className={`p-1 rounded ${
              m.sender === user.uid ? "bg-blue-200 text-right" : "bg-gray-200 text-left"
            }`}
          >
            {m.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje"
          className="flex-1 border rounded p-2"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-3 rounded">
          Enviar
        </button>
      </div>
    </div>
  );
}
