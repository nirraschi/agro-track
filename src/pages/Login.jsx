import { useState } from "react";
import { signIn } from "../services/authService";
import bamboo from '../assets/bamboo_1.png'

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await signIn(email, password);
            setSuccess("Verificando credenciales...");
            window.location.href = "/";
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Panel izquierdo */}
            <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-green-900 p-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.04]" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/[0.04]" />
                <div className="z-10 flex flex-col items-center text-center">
                    <div className="w-18 h-18 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-6 p-4">
                        <img src={bamboo} alt="logo" className="w-12 h-12 " />
                    </div>
                    <h1 className="text-2xl font-medium text-green-50 leading-snug mb-2">
                        Juan Hael<br />Agropecuaria
                    </h1>
                    <div className="w-10 h-px bg-green-400/40 my-4" />
                    <p className="text-sm text-green-300/75 max-w-[200px] leading-relaxed">
                        Sistema de gestión
                    </p>
                    <div className="flex gap-8 mt-8">
                        {[

                            { icon: "📈", label: "Producción" },
                            { icon: "🚜", label: "Cosecha" },
                            { icon: "📄", label: "Remitos" },
                        ].map(({ icon, label }) => (
                            <div key={label} className="text-center">
                                <div className="text-xl">{icon}</div>
                                <div className="text-[11px] text-green-400/60 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel derecho */}
            <div className="flex flex-col items-center justify-center w-full md:w-[440px] bg-white px-10 py-12">
                <div className="w-full max-w-[340px]">
                    <div className="mb-8">
                        <h2 className="text-xl font-medium text-gray-900 mb-1">Iniciar sesión</h2>
                        <p className="text-sm text-gray-500">Ingresá tus credenciales para continuar</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉</span>
                                <input
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 pl-9 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? "🙈" : "👁"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 text-sm px-3 py-2.5 rounded-lg">
                                <span>⚠</span> {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 text-sm px-3 py-2.5 rounded-lg">
                                <span>✓</span> {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full h-11 bg-green-800 hover:bg-green-900 active:scale-[0.99] text-green-50 font-medium rounded-lg text-sm mt-2 transition-colors"
                        >
                            Ingresar
                        </button>
                    </form>

                    <div className="flex justify-between mt-5">
                        <a href="/register" className="text-sm text-green-700 hover:underline">
                            Crear una cuenta
                        </a>
                        <a href="/reset-password" className="text-sm text-green-700 hover:underline">
                            Olvidé mi contraseña
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}