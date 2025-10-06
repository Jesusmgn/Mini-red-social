# 🌐 Mini Red Social

Una aplicación web desarrollada con **React** y **Firebase**, que simula las principales funciones de una red social moderna: registro de usuarios, publicaciones, amigos, chat en tiempo real, notificaciones y personalización de perfil.

---

## 🚀 Características principales

### 🔐 Autenticación
- Registro e inicio de sesión con **Firebase Authentication**.  
- Validación de correo y contraseña.  
- Modal interactivo para crear una nueva cuenta.  
- Datos del usuario almacenados en **Firestore** con campos como nombre, apellido, género y fecha de nacimiento.  

📁 Archivo principal: `Auth.jsx`

---

### 📰 Publicaciones (Feed)
- Los usuarios pueden crear publicaciones con texto o imágenes.  
- Carga de archivos a **Firebase Storage** y almacenamiento del enlace en Firestore.  
- El feed se actualiza en **tiempo real** mediante `onSnapshot`.  
- Se pueden dar **likes** y comentar publicaciones.  
- Se envían **notificaciones automáticas** al autor cuando alguien reacciona o comenta.

📁 Archivos:  
- `NewPost.jsx`  
- `Feed.jsx`  
- `CommentBox.jsx`

---

### 🤝 Sistema de amigos
- Envío, aceptación y cancelación de solicitudes de amistad.  
- Posibilidad de eliminar amigos.  
- Listado de amigos y sugerencias de personas que quizá conozcas.  
- Notificaciones automáticas por cada acción (solicitud, aceptación, eliminación).

📁 Archivos:  
- `FriendButton.jsx`  
- `Friends.jsx`

---

### 💬 Chat en tiempo real
- Sistema de mensajería privada entre amigos.  
- Chats múltiples flotantes (similar a Facebook Messenger).  
- Envío de mensajes instantáneos mediante **Firestore**.  
- Notificaciones automáticas al receptor cuando se recibe un nuevo mensaje.  

📁 Archivos:  
- `MessengerChat.jsx`  
- `MessengerMultiChat.jsx`  
- `ChatBox.jsx`

---

### 🔔 Notificaciones
- Sistema de notificaciones en tiempo real con Firestore.  
- Tipos de notificación: `like`, `comment`, `message`, `friend_request`, `friend_accept`, `friend_remove`.  
- Campanita interactiva con contador de notificaciones no leídas.  
- Opción para marcarlas todas como leídas.  

📁 Archivos:  
- `NotificationBell.jsx`  
- `NotificationDropdown.jsx`

---

### 👤 Perfil de usuario
- Página de perfil con foto, nombre, apellido, género y fecha de nacimiento.  
- Cambio de foto con carga a **Firebase Storage**.  
- Edición de datos personales.  
- Cierre de sesión seguro.  
- Personalización de color de perfil con almacenamiento en Firestore.

📁 Archivos:  
- `Profile.jsx`  
- `ProfileTheme.jsx`

---

## 🧩 Tecnologías utilizadas

| Tecnología | Uso principal |
|-------------|----------------|
| **React.js** | Estructura del frontend y componentes. |
| **Firebase Authentication** | Sistema de login y registro. |
| **Firebase Firestore** | Base de datos en tiempo real. |
| **Firebase Storage** | Almacenamiento de imágenes. |
| **Tailwind CSS** | Estilos rápidos y responsivos. |
| **Heroicons** | Iconos SVG modernos. |

---

## ⚙️ Instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Jesusmgn/mini-red-social.git
cd mini-red-social
### 2️⃣ Instalar dependencias
npm install
### 3️⃣ Configurar Firebase
Crea un archivo .env.local o edita firebase.js con tu configuración:
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
### 4️⃣ Ejecutar el servidor de desarrollo
npm run dev
