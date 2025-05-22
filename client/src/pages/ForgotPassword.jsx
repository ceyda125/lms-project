import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { LockClosedIcon } from "@heroicons/react/solid";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "📨 Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
      );
    } catch (error) {
      setMessage("❌ Hata: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <LockClosedIcon className="h-10 w-10 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Şifremi Unuttum
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Lütfen hesabınıza ait e-posta adresini girin.
        </p>

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleReset}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md transition duration-300"
        >
          Sıfırlama Linki Gönder
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
