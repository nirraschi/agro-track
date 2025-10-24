import React from 'react'

const ResetPassword = () => {
    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                // onSubmit={handleRegister}
                className="bg-white p-6 rounded-lg shadow-md w-80 flex flex-col gap-3"
            >
                <h2 className="text-xl font-bold text-center">Restaura tu contraseña</h2>
                <p>Ingresa tu mail</p>
                <input
                    type="email"
                    placeholder="Email"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    className="border rounded p-2"
                    required
                />

                <button
                    type="submit"
                    className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Enviar mail de restauración
                </button>


            </form>
        </div>


    )
}

export default ResetPassword