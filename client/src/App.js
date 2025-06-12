import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebaseConfig";
import { useNavigate } from "react-router-dom"; // Eklenmiş

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import CreateLesson from "./pages/Teacher/CreateLesson";
import StudentPerformance from "./pages/Teacher/StudentPerformance";
import LiveLesson from "./pages/LiveLesson";
import Layout from "./components/Layout";
import LiveLessonsPage from "./pages/Student/LiveLessonsPage";
import CreateExamPage from "./pages/Teacher/CreateExamPage";
import UploadVideoPage from "./pages/Teacher/UploadVideoPage";
import ViewVideosPage from "./pages/Teacher/ViewVideosPage";
import StudentExamList from "./pages/Student/StudentExamList";
import TakeExam from "./pages/Student/TakeExam";
import MyExamsPage from "./pages/Teacher/MyExamsPage";
import MyLessonsPage from "./pages/Teacher/MyLessonsPage";
import TakeClassicExamPage from "./pages/Student/TakeClassicExamPage";
import CheckAnswersPage from "./pages/Teacher/CheckAnsversPage";
import StudentGradesPage from "./pages/Student/StudentGradesPage";

// Error Boundary bileşeni
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <h1>Bir şeyler yanlış gitti. Lütfen tekrar deneyin.</h1>;
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // Firebase oturum takibi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setRole(userData.role);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return unsubscribe;
  }, []);

  // Çıkış fonksiyonu
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <ErrorBoundary>
      <Layout user={user} role={role} handleLogout={handleLogout}>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Home />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} role={role} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route path="/check-answers" element={<CheckAnswersPage />} />
          <Route
            path="/take-classic-exam/:examId"
            element={<TakeClassicExamPage />}
          />
          <Route path="/my-lessons" element={<MyLessonsPage />} />
          <Route path="/my-exams" element={<MyExamsPage />} />
          <Route path="/create-exam" element={<CreateExamPage />} />
          <Route
            path="/upload-video"
            element={<UploadVideoPage user={user} />}
          />
          <Route path="/view-video" element={<ViewVideosPage role={role} />} />
          <Route path="/grades" element={<StudentGradesPage />} />
          <Route path="/student-performance" element={<StudentPerformance />} />
          <Route path="/live-lessons" element={<LiveLessonsPage />} />
          <Route path="/exams" element={<StudentExamList />} />
          <Route path="/take-exam/:examId" element={<TakeExam />} />
          <Route
            path="/create-lesson"
            element={
              user && role === "teacher" ? (
                <CreateLesson user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/live-lesson/:lessonId" element={<LiveLesson />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
