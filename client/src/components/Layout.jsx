import React from "react";
import { Link } from "react-router-dom";

const Layout = ({ children, user, role, handleLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-purple-600 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-2xl font-bold">
            SmartLMS
          </Link>
          <div>
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-gray-300 mr-4"
                >
                  Giriş Yap
                </Link>
                <Link to="/register" className="text-white hover:text-gray-300">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                <span className="text-white mr-4">
                  Hoş geldin {user.name} ({role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-gray-300"
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
      <footer className="bg-purple-600 p-4 text-white text-center">
        <p>© 2025 SmartLMS, Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default Layout;
