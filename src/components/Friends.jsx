import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import FriendButton from "./FriendButton";

export default function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // cargar amigos y sugerencias
  useEffect(() => {
    const loadFriendsAndSuggestions = async () => {
      if (!user) return;

      try {
        // obtener lista de mis amigos
        const refUser = doc(db, "users", user.uid);
        const snap = await getDoc(refUser);
        const data = snap.exists() ? snap.data() : {};
        const myFriends = data.friends || [];

        // traer datos completos de mis amigos
        const friendsData = [];
        for (let fid of myFriends) {
          const fSnap = await getDoc(doc(db, "users", fid));
          if (fSnap.exists()) {
            friendsData.push({ id: fid, ...fSnap.data() });
          }
        }
        setFriends(friendsData);

        // traer todos los usuarios para sugerencias
        const querySnap = await getDocs(collection(db, "users"));
        const allUsers = querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // excluirme a mí y a mis amigos
        const suggested = allUsers.filter(
          (u) => u.id !== user.uid && !myFriends.includes(u.id)
        );

        setSuggestions(suggested);
      } catch (err) {
        console.error("Error cargando amigos:", err);
      }
    };

    loadFriendsAndSuggestions();
  }, [user]);

  // actualizar listas cuando agrego o elimino un amigo
  const handleFriendChange = (action, friendId) => {
    if (action === "added") {
      // mover de sugerencias a amigos
      const newFriend = suggestions.find((u) => u.id === friendId);
      if (newFriend) {
        setFriends((prev) => [...prev, newFriend]);
        setSuggestions((prev) => prev.filter((u) => u.id !== friendId));
      }
    } else if (action === "removed") {
      // mover de amigos a sugerencias
      const removedFriend = friends.find((u) => u.id === friendId);
      if (removedFriend) {
        setSuggestions((prev) => [...prev, removedFriend]);
        setFriends((prev) => prev.filter((u) => u.id !== friendId));
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">👥 Tus amigos</h2>
      {friends.length > 0 ? (
        <ul className="space-y-2 mb-6">
          {friends.map((f) => (
            <li
              key={f.id}
              className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded"
            >
              <div>
                <p className="font-semibold">{f.name || f.email}</p>
                <p className="text-xs text-gray-500">{f.email}</p>
              </div>
              <FriendButton
                currentUser={user}
                targetUser={f}
                onChange={handleFriendChange}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mb-6">Aún no tienes amigos añadidos.</p>
      )}

      <h2 className="text-xl font-bold mb-4">⭐ Personas que quizá conozcas</h2>
      {suggestions.length > 0 ? (
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded"
            >
              <div>
                <p className="font-semibold">{s.name || s.email}</p>
                <p className="text-xs text-gray-500">{s.email}</p>
              </div>
              <FriendButton
                currentUser={user}
                targetUser={s}
                onChange={handleFriendChange}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay sugerencias disponibles.</p>
      )}
    </div>
  );
}
