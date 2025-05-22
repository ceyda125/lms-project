import React from "react";
import { Link } from "react-router-dom";

const Layout = ({ children, user, role, handleLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold text-gray-800">
            SmartLMS
          </Link>
          <div className="space-x-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-700">Merhaba, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © 2025 SmartLMS, Tüm hakları saklıdır.
      </footer>
    </div>
  );
};

export default Layout;
