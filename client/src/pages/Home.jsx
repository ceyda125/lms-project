import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-600">🎓 SmartLMS</h1>
        <p className="text-lg text-gray-700 mb-6">
          Öğrenci ve öğretmenlerin buluştuğu modern bir öğrenme platformu.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md transition"
          >
            Giriş Yap
          </Link>
          <Link
            to="/register"
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-md transition"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
