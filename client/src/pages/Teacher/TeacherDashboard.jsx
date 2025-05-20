import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  CogIcon,
  PlusCircleIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ClipboardListIcon,
} from "@heroicons/react/outline";

function TeacherDashboard({ user }) {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserId = user?.uid || auth.currentUser?.uid;
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    const fetchLessons = async () => {
      try {
        const q = query(
          collection(db, "lessons"),
          where("teacherId", "==", currentUserId)
        );
        const querySnapshot = await getDocs(q);
        const lessonList = [];
        querySnapshot.forEach((doc) => {
          lessonList.push({ id: doc.id, ...doc.data() });
        });
        setLessons(lessonList);
      } catch (err) {
        console.error("Dersler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [user, navigate]);

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("tr-TR", options).format(date);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 rounded-lg shadow-xl text-white">
      <h3 className="text-3xl font-bold mb-4 text-center">
        👨‍🏫 Öğretmen Paneli
      </h3>

      <div className="space-y-4 mb-6">
        <Link
          to="/create-lesson"
          className="flex items-center space-x-2 text-lg text-white hover:text-yellow-400 transition"
        >
          <PlusCircleIcon className="w-6 h-6" />
          <span>Ders Oluştur</span>
        </Link>
        <Link
          to="/create-exam"
          className="flex items-center space-x-2 text-lg text-white hover:text-yellow-400 transition"
        >
          <CogIcon className="w-6 h-6" />
          <span>Sınav Oluştur</span>
        </Link>
        <Link
          to="/student-performance"
          className="flex items-center space-x-2 text-lg text-white hover:text-yellow-400 transition"
        >
          <UserGroupIcon className="w-6 h-6" />
          <span>Öğrenci Performansları</span>
        </Link>

        <Link
          to="/my-lessons"
          className="flex items-center space-x-2 text-lg text-white hover:text-yellow-400 transition"
        >
          <VideoCameraIcon className="w-6 h-6" />
          <span>Oluşturduğum Canlı Dersler</span>
        </Link>
        <Link
          to="/my-exams"
          className="flex items-center space-x-2 text-lg text-white hover:text-yellow-400 transition"
        >
          <ClipboardListIcon className="w-6 h-6" />
          <span>Oluşturduğum Sınavlar</span>
        </Link>

        <Link
          to="/check-answers"
          className="flex items-center space-x-2 text-lg text-white hover:text-yellow-400 transition"
        >
          <ClipboardListIcon className="w-6 h-6" />
          <span>Öğrenci Cevaplarını Değerlendir</span>
        </Link>
      </div>
    </div>
  );
}

export default TeacherDashboard;
