import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">SmartLMS</h1>
        <p className="text-base text-gray-600 mb-6">
          Öğrenciler ve öğretmenler için modern bir öğrenme platformu.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-md transition"
          >
            Giriş Yap
          </Link>
          <Link
            to="/register"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-md transition"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
