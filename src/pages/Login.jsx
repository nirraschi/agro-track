import { useState } from "react";
import { signIn } from "../services/authService";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await signIn(email, password);
            setSuccess("Ingresando...");
            //redirigir a pagina de inicio -> editar redirect
            window.location.href = "/";


        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleRegister}
                className="bg-white p-6 rounded-lg shadow-md w-80 flex flex-col gap-3"
            >
                <h2 className="text-xl font-bold text-center">Iniciar Sesión</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <button
                    type="submit"
                    className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Ingresar
                </button>

                <a href="/register" className="text-sm text-center text-blue-500 hover:underline">
                    Registrarse
                </a>
                <a href="/reset-password" className="text-sm text-center text-blue-500 hover:underline">
                    Olvide mi contraseña
                </a>
            </form>
        </div>
    );
}
