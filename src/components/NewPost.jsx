// src/components/NewPost.jsx
import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PhotoIcon } from "@heroicons/react/24/solid"; // Icono de foto

export default function NewPost({ user }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const submit = async () => {
    if (!text && !file) return;
    setLoading(true);

    try {
      let imageUrl = "";
      if (file) {
        const fileRef = ref(storage, `posts/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "posts"), {
        author: user.email,
        authorUid: user.uid,   // 👈 agregado para notificaciones
        text,
        image: imageUrl,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
      });

      // Reset form
      setText("");
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error al publicar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-3">
      <textarea
        placeholder="¿Qué está pasando?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white"
      />

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Vista previa"
            className="max-h-60 rounded-md object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs"
          >
            ❌ Quitar
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label
          htmlFor="fileInput"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700"
        >
          <PhotoIcon className="h-5 w-5" />
          Foto/Video
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}
