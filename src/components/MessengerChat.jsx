import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export default function MessengerChat({ user, chatId, targetUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 📩 Cargar mensajes en tiempo real
  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [chatId]);

  // 🚀 Enviar mensaje + notificación
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Guardar mensaje en la colección del chat
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage,
        sender: user.uid,
        receiver: targetUser?.uid || targetUser?.id, // 👈 siempre UID del receptor
        createdAt: serverTimestamp(),
      });

      // 🔔 Crear notificación para el receptor
      const destId = targetUser?.uid || targetUser?.id; // 👈 aseguramos UID válido
      if (destId) {
        await addDoc(collection(db, "notifications"), {
          to: destId, // 👈 ahora siempre guarda el UID correcto
          from: user.uid,
          type: "message",
          message: `${user.email} te envió un mensaje`,
          timestamp: serverTimestamp(),
          read: false,
        });
      }

      setNewMessage("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-t-lg shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-2 flex justify-between items-center rounded-t-lg">
        <span className="font-semibold">
          {targetUser?.name || targetUser?.email || "Chat"}
        </span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 font-bold"
        >
          ✕
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-60 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg text-sm max-w-[80%] ${
              msg.sender === user.uid
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex border-t border-gray-300 dark:border-gray-700"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-2 py-1 text-sm outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          className="px-3 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
