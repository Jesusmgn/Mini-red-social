import React, { useState } from "react";
import MessengerChat from "./MessengerChat";

export default function MessengerMultiChat({ user, friends }) {
  const [openChats, setOpenChats] = useState([]);

  // abrir un chat
  const openChat = (friend) => {
    if (!openChats.find((c) => c.friend === friend)) {
      setOpenChats([...openChats, { friend }]);
    }
  };

  // cerrar un chat
  const closeChat = (friend) => {
    setOpenChats(openChats.filter((c) => c.friend !== friend));
  };

  return (
    <>
      {/* Lista de contactos flotante (botón 💬) */}
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
        {friends.length > 0 &&
          friends.map((f, i) => (
            <button
              key={i}
              onClick={() => openChat(f)}
              className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700"
            >
              💬 {f.name || f.email || "Amigo"}
            </button>
          ))}
      </div>

      {/* Ventanas de chats abiertas */}
      <div className="fixed bottom-20 right-4 flex gap-4">
        {openChats.map((c, i) => (
          <MessengerChat
            key={i}
            user={user}
            chatId={`${user.uid}_${c.friend.uid || c.friend}`} // combinación única
            friend={c.friend}
            onClose={() => closeChat(c.friend)}
          />
        ))}
      </div>
    </>
  );
}
