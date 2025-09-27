import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import NewPost from "./components/NewPost";
import Feed from "./components/Feed";
import Friends from "./components/Friends";

// nuevos imports
import NotificationBell from "./components/NotificationBell";
import MessengerChat from "./components/MessengerChat";
import { db, setUserOnline, setUserOffline } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

// 🔑 función auxiliar para generar un chatId único
function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export default function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [friends, setFriends] = useState([]);
  const [openChats, setOpenChats] = useState([]); // 👈 múltiples chats abiertos
  const [activePage, setActivePage] = useState("home"); // 👈 control de sección

  // cargar modo oscuro guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 🔎 cargar amigos en tiempo real (para la lista de contactos)
  useEffect(() => {
    if (!user) return;

    const refUser = doc(db, "users", user.uid);

    const unsub = onSnapshot(refUser, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const uids = data.friends || [];

        // traer info de cada amigo
        const friendData = [];
        for (let fid of uids) {
          const fSnap = await getDoc(doc(db, "users", fid));
          if (fSnap.exists()) {
            friendData.push({ id: fid, ...fSnap.data() });
          }
        }
        setFriends(friendData);
      }
    });

    return () => unsub();
  }, [user]);

  // 🟢 manejar estado online/offline del usuario
  useEffect(() => {
    if (!user) return;

    setUserOnline(user.uid); // marcar online al entrar

    const handleUnload = () => setUserOffline(user.uid);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user]);

  // abrir un nuevo chat
  const openChat = (friend) => {
    if (!openChats.find((c) => c.id === friend.id)) {
      setOpenChats([...openChats, friend]);
    }
  };

  // cerrar chat
  const closeChat = (id) => {
    setOpenChats(openChats.filter((c) => c.id !== id));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Auth onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-3 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          🚀 Mini Red Social
        </h1>
        <div className="flex items-center gap-4">
          <NotificationBell user={user} />
          <p className="text-sm">{user.email}</p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {darkMode ? "🌙 Oscuro" : "☀️ Claro"}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar izquierdo */}
        <aside className="hidden md:block w-1/5 bg-white dark:bg-gray-800 shadow p-4 space-y-4">
          <nav className="space-y-2">
            <a
              href="#"
              onClick={() => setActivePage("home")}
              className={`block p-2 rounded ${
                activePage === "home"
                  ? "bg-blue-100 dark:bg-blue-700 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              🏠 Inicio
            </a>
            <a
              href="#"
              onClick={() => setActivePage("friends")}
              className={`block p-2 rounded ${
                activePage === "friends"
                  ? "bg-blue-100 dark:bg-blue-700 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              👥 Amigos
            </a>
            <a
              href="#"
              className="block hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            >
              👨‍👩‍👧‍👦 Grupos
            </a>
            <a
              href="#"
              className="block hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            >
              🎥 Videos
            </a>
            <a
              href="#"
              className="block hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            >
              💾 Guardado
            </a>
          </nav>
        </aside>

        {/* Centro dinámico */}
        <main className="flex-1 max-w-3xl mx-auto p-4 space-y-4">
          {activePage === "home" && (
            <>
              <Profile user={user} onLogout={() => setUser(null)} />
              <NewPost user={user} />
              <Feed user={user} />
            </>
          )}

          {activePage === "friends" && <Friends user={user} />}
        </main>

        {/* Sidebar derecho dinámico */}
        <aside className="hidden lg:block w-1/5 bg-white dark:bg-gray-800 shadow p-4 space-y-4">
          <h3 className="font-bold mb-2">Contactos</h3>
          <ul className="space-y-2 text-sm">
            {friends.length > 0 ? (
              friends.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-2 cursor-pointer hover:underline"
                  onClick={() => openChat(f)} // 👈 abre chat con ese amigo
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      f.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                  {f.name || f.email}
                </li>
              ))
            ) : (
              <li className="text-gray-500">Sin amigos añadidos</li>
            )}
          </ul>
        </aside>
      </div>

      {/* Chats flotantes múltiples */}
      <div className="fixed bottom-0 right-4 flex gap-4">
        {openChats.map((friend) => (
          <MessengerChat
            key={friend.id}
            user={user}
            chatId={getChatId(user.uid, friend.id)}
            targetUser={friend}
            onClose={() => closeChat(friend.id)}
          />
        ))}
      </div>
    </div>
  );
}
