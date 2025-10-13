// src/components/CommentBox.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";

export default function CommentBox({ post, user }) {
  const [text, setText] = useState("");

  // 🔎 Fallback: obtener UID del autor si el post no trae authorUid
  const resolveAuthorUid = async () => {
    if (post?.authorUid) return post.authorUid;
    if (!post?.author) return null; // no hay email
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", post.author),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].id; // el id del doc es el UID
      }
    } catch (e) {
      console.error("No se pudo resolver authorUid (comment):", e);
    }
    return null;
  };

  const submit = async () => {
    if (!text.trim()) return;

    // 1) guardar el comentario en el post
    const refDoc = doc(db, "posts", post.id);
    await updateDoc(refDoc, {
      comments: arrayUnion({ author: user.email, text }),
    });

    // 2) notificar al autor del post (si no soy yo)
    try {
      const authorUid = await resolveAuthorUid();
      if (authorUid && authorUid !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          to: authorUid,                         // ✅ siempre UID del autor
          from: user.uid,
          type: "comment",
          message: `${user.email} comentó tu publicación`,
          timestamp: serverTimestamp(),
          read: false,
        });
      }
    } catch (e) {
      console.error("Error creando notificación de comentario:", e);
    }

    setText("");
  };

  return (
    <div className="mt-2 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Comenta..."
        className="flex-1 border p-2 rounded-md"
      />
      <button
        onClick={submit}
        className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
      >
        Enviar
      </button>
    </div>
  );
}
