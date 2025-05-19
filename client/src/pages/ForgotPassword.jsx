import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">
          🔑 Şifremi Unuttum
        </h2>
        <input
          type="email"
          placeholder="E-posta adresinizi girin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleReset}
          className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
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
