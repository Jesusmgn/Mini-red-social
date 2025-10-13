import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { defaultAvatar, timeAgo } from "./utils";
import CommentBox from "./CommentBox";

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "posts"), (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // 🚩 Fallback: obtener UID del autor si el post no trae authorUid
  const resolveAuthorUid = async (post) => {
    if (post.authorUid) return post.authorUid;
    if (!post.author) return null; // no hay email
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
      console.error("No se pudo resolver authorUid:", e);
    }
    return null;
  };

  const toggleLike = async (post) => {
    const refDoc = doc(db, "posts", post.id);
    const already = Array.isArray(post.likes) && post.likes.includes(user.email);

    if (already) {
      await updateDoc(refDoc, { likes: arrayRemove(user.email) });
      return;
    }

    await updateDoc(refDoc, { likes: arrayUnion(user.email) });

    // 🔔 Notificación al autor (evitar notificarme a mí mismo)
    const authorUid = await resolveAuthorUid(post);
    if (authorUid && authorUid !== user.uid) {
      try {
        await addDoc(collection(db, "notifications"), {
          to: authorUid,                       // UID del autor ✅
          from: user.uid,
          type: "like",
          message: `${user.email} le dio like a tu publicación`,
          timestamp: serverTimestamp(),
          read: false,
        });
      } catch (e) {
        console.error("Error creando notificación de like:", e);
      }
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <div key={p.id} className="p-4 bg-white rounded-xl shadow-md">
          {p.image && <img src={p.image} alt="post" className="rounded-lg mb-2" />}
          <h4 className="font-bold">{p.author}</h4>
          <p className="my-2">{p.text}</p>
          <small className="text-gray-500">
            {p.createdAt?.toDate ? timeAgo(p.createdAt.toDate()) : "justo ahora"}
          </small>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => toggleLike(p)}
              className="px-3 py-1 rounded-md bg-pink-100 hover:bg-pink-200"
            >
              ❤️ {Array.isArray(p.likes) ? p.likes.length : 0}
            </button>
          </div>

          <CommentBox post={p} user={user} />

          {p.comments?.length > 0 && (
            <div className="mt-2 space-y-1">
              {p.comments.map((c, i) => (
                <p key={i} className="text-sm">
                  <strong>{c.author}:</strong> {c.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
