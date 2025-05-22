import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { LockClosedIcon } from "@heroicons/react/solid";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <LockClosedIcon className="h-10 w-10 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          SmartLMS Giriş
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Hesabınızla giriş yapın.
        </p>

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <div className="text-right mb-4">
          <Link
            to="/forgot-password"
            className="text-sm text-indigo-500 hover:underline"
          >
            Şifreni mi unuttun?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md transition duration-300"
        >
          Giriş Yap
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Hesabınız yok mu?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
