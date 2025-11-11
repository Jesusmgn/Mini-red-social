// src/components/FriendButton.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function FriendButton({ currentUser, targetUser, onChange }) {
  const [busy, setBusy] = useState(false);
  const [relation, setRelation] = useState("none"); // none | outgoing | incoming | friend

  // Normaliza el UID del objetivo
  const targetId = targetUser?.uid || targetUser?.id;

  // Carga el estado de relación desde mi documento (friends / incoming / outgoing)
  useEffect(() => {
    const load = async () => {
      if (!currentUser || !targetId) return;
      try {
        const meRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(meRef);
        const data = snap.exists() ? snap.data() : {};

        const friends = Array.isArray(data.friends) ? data.friends : [];
        const incoming = Array.isArray(data.incomingRequests) ? data.incomingRequests : [];
        const outgoing = Array.isArray(data.outgoingRequests) ? data.outgoingRequests : [];

        if (friends.includes(targetId)) setRelation("friend");
        else if (incoming.includes(targetId)) setRelation("incoming");
        else if (outgoing.includes(targetId)) setRelation("outgoing");
        else setRelation("none");
      } catch (err) {
        console.error("Error verificando relación:", err);
      }
    };
    load();
  }, [currentUser, targetId]);

  // ▶️ Enviar solicitud
  const sendRequest = async () => {
    if (!currentUser || !targetId) return;
    setBusy(true);
    try {
      // yo → outgoingRequests
      await updateDoc(doc(db, "users", currentUser.uid), {
        outgoingRequests: arrayUnion(targetId),
      });
      // target → incomingRequests
      await updateDoc(doc(db, "users", targetId), {
        incomingRequests: arrayUnion(currentUser.uid),
      });

      // notificación
      await addDoc(collection(db, "notifications"), {
        to: targetId,
        from: currentUser.uid,
        type: "friend_request",
        message: `${currentUser.email} te envió una solicitud de amistad`,
        timestamp: serverTimestamp(),
        read: false,
      });

      setRelation("outgoing");
    } catch (err) {
      console.error("Error al enviar solicitud:", err);
      // fallback si el documento del usuario no tenía campos
      try {
        await setDoc(
          doc(db, "users", currentUser.uid),
          { outgoingRequests: [targetId] },
          { merge: true }
        );
        await setDoc(
          doc(db, "users", targetId),
          { incomingRequests: [currentUser.uid] },
          { merge: true }
        );
        setRelation("outgoing");
      } catch (e2) {
        console.error("Fallback sendRequest:", e2);
      }
    } finally {
      setBusy(false);
    }
  };

  // ❌ Cancelar solicitud enviada
  const cancelRequest = async () => {
    if (!currentUser || !targetId) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        outgoingRequests: arrayRemove(targetId),
      });
      await updateDoc(doc(db, "users", targetId), {
        incomingRequests: arrayRemove(currentUser.uid),
      });
      setRelation("none");
    } catch (err) {
      console.error("Error al cancelar solicitud:", err);
    } finally {
      setBusy(false);
    }
  };

  // ✅ Aceptar solicitud recibida
  const acceptRequest = async () => {
    if (!currentUser || !targetId) return;
    setBusy(true);
    try {
      // me: saco incoming, agrego friend
      await updateDoc(doc(db, "users", currentUser.uid), {
        incomingRequests: arrayRemove(targetId),
        friends: arrayUnion(targetId),
      });
      // target: saco outgoing, agrego friend
      await updateDoc(doc(db, "users", targetId), {
        outgoingRequests: arrayRemove(currentUser.uid),
        friends: arrayUnion(currentUser.uid),
      });

      // notificación al solicitante
      await addDoc(collection(db, "notifications"), {
        to: targetId,
        from: currentUser.uid,
        type: "friend_accept",
        message: `${currentUser.email} aceptó tu solicitud de amistad`,
        timestamp: serverTimestamp(),
        read: false,
      });

      setRelation("friend");
      onChange?.("added", targetId);
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);
    } finally {
      setBusy(false);
    }
  };

  // 🗑️ Eliminar amigo (ambos lados)
  const removeFriend = async () => {
    if (!currentUser || !targetId) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        friends: arrayRemove(targetId),
      });
      await updateDoc(doc(db, "users", targetId), {
        friends: arrayRemove(currentUser.uid),
      });

      await addDoc(collection(db, "notifications"), {
        to: targetId,
        from: currentUser.uid,
        type: "friend_remove",
        message: `${currentUser.email} te eliminó de sus amigos`,
        timestamp: serverTimestamp(),
        read: false,
      });

      setRelation("none");
      onChange?.("removed", targetId);
    } catch (err) {
      console.error("Error al eliminar amigo:", err);
    } finally {
      setBusy(false);
    }
  };

  // 🧠 Render según relación
  // none        → "Agregar amigo"
  // outgoing    → "Cancelar solicitud"
  // incoming    → "Aceptar solicitud"
  // friend      → "Eliminar amigo"
  return (
    <div className="flex gap-2">
      {relation === "none" && (
        <button
          onClick={sendRequest}
          disabled={busy || !targetId}
          className={`px-4 py-2 rounded-md font-semibold bg-green-600 text-white ${
            busy ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Agregar amigo
        </button>
      )}

      {relation === "outgoing" && (
        <button
          onClick={cancelRequest}
          disabled={busy}
          className={`px-4 py-2 rounded-md font-semibold bg-gray-400 text-white ${
            busy ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Cancelar solicitud
        </button>
      )}

      {relation === "incoming" && (
        <button
          onClick={acceptRequest}
          disabled={busy}
          className={`px-4 py-2 rounded-md font-semibold bg-blue-600 text-white ${
            busy ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Aceptar solicitud
        </button>
      )}

      {relation === "friend" && (
        <button
          onClick={removeFriend}
          disabled={busy}
          className={`px-4 py-2 rounded-md font-semibold bg-red-600 text-white ${
            busy ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Eliminar amigo
        </button>
      )}
    </div>
  );
}
