import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Auth({ onLogin }) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");

    // Estado del modal de registro
    const [showRegister, setShowRegister] = useState(false);

    // Campos de registro
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birth, setBirth] = useState("");
    const [gender, setGender] = useState("");

    // Iniciar sesión
    const login = async () => {
        setError("");
        try {
            const res = await signInWithEmailAndPassword(auth, email, pass);
            onLogin(res.user);
        } catch (err) {
            setError("Error al iniciar sesión: " + err.message);
        }
    };

    // Crear cuenta
    const register = async () => {
        setError("");
        if (!email.includes("@")) {
            setError("Ingresa un correo válido.");
            return;
        }
        if (pass.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (!name || !lastName || !birth || !gender) {
            setError("Completa todos los campos del registro.");
            return;
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            const user = res.user;

            // Guardamos perfil en Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                lastName,
                birth,
                gender,
                email,
                createdAt: new Date(),
            });

            onLogin(user);
            setShowRegister(false); // cerramos modal
        } catch (err) {
            setError("Error al crear cuenta: " + err.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl w-full px-4">
                {/* Branding */}
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-blue-600 text-5xl font-bold">MiniRed</h1>
                    <p className="text-lg mt-2 text-gray-700">
                        Conéctate y comparte con tus amigos en todo el mundo.
                    </p>
                </div>

                {/* Formulario de login */}
                <div className="w-full max-w-sm bg-white shadow-lg rounded-lg p-6 space-y-4">
                    <h2 className="text-center text-xl font-semibold text-gray-800">
                        Iniciar sesión
                    </h2>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
                    />

                    <button
                        onClick={login}
                        className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700"
                    >
                        Entrar
                    </button>

                    <p className="text-center text-blue-600 cursor-pointer hover:underline">
                        ¿Olvidaste tu contraseña?
                    </p>

                    <hr />

                    <button
                        onClick={() => setShowRegister(true)}
                        className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700"
                    >
                        Crear cuenta nueva
                    </button>
                </div>
            </div>

            {/* Modal de registro */}
            {showRegister && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Crear cuenta nueva</h2>
                            <button
                                onClick={() => setShowRegister(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                ✖
                            </button>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-1/2 p-2 border rounded"
                            />
                            <input
                                type="text"
                                placeholder="Apellido"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-1/2 p-2 border rounded"
                            />
                        </div>

                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                        />

                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            className="w-full p-2 border rounded"
                        />

                        <label className="block text-sm text-gray-600">
                            Fecha de nacimiento
                        </label>
                        <input
                            type="date"
                            value={birth}
                            onChange={(e) => setBirth(e.target.value)}
                            className="w-full p-2 border rounded"
                        />

                        <label className="block text-sm text-gray-600">Género</label>
                        <div className="flex gap-4">
                            <label>
                                <input
                                    type="radio"
                                    value="Masculino"
                                    checked={gender === "Masculino"}
                                    onChange={(e) => setGender(e.target.value)}
                                />{" "}
                                Masculino
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="Femenino"
                                    checked={gender === "Femenino"}
                                    onChange={(e) => setGender(e.target.value)}
                                />{" "}
                                Femenino
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="Otro"
                                    checked={gender === "Otro"}
                                    onChange={(e) => setGender(e.target.value)}
                                />{" "}
                                Otro
                            </label>
                        </div>

                        <button
                            onClick={register}
                            className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700"
                        >
                            Registrarse
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
