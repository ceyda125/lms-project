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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-5xl w-full p-8 bg-white rounded-xl shadow-md">
        <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          👨‍🏫 Öğretmen Paneli
        </h3>

        <div className="space-y-6">
          <DashboardLink
            to="/create-lesson"
            icon={<PlusCircleIcon className="w-7 h-7 text-indigo-600" />}
            label="Ders Oluştur"
          />
          <DashboardLink
            to="/create-exam"
            icon={<CogIcon className="w-7 h-7 text-indigo-600" />}
            label="Sınav Oluştur"
          />
          <DashboardLink
            to="/upload-video"
            icon={<CogIcon className="w-7 h-7 text-indigo-600" />}
            label="Video Yükle"
          />
          <DashboardLink
            to="/view-video"
            icon={<CogIcon className="w-7 h-7 text-indigo-600" />}
            label="Videoları Görüntüle"
          />
          <DashboardLink
            to="/student-performance"
            icon={<UserGroupIcon className="w-7 h-7 text-indigo-600" />}
            label="Öğrenci Performansları"
          />
          <DashboardLink
            to="/my-lessons"
            icon={<VideoCameraIcon className="w-7 h-7 text-indigo-600" />}
            label="Oluşturduğum Canlı Dersler"
          />
          <DashboardLink
            to="/my-exams"
            icon={<ClipboardListIcon className="w-7 h-7 text-indigo-600" />}
            label="Oluşturduğum Sınavlar"
          />
          <DashboardLink
            to="/check-answers"
            icon={<ClipboardListIcon className="w-7 h-7 text-indigo-600" />}
            label="Öğrenci Cevaplarını Değerlendir"
          />
        </div>
      </div>
    </div>
  );
}

const DashboardLink = ({ to, icon, label }) => {
  return (
    <Link
      to={to}
      className="flex items-center space-x-4 p-5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
    >
      {icon}
      <span className="text-indigo-800 font-semibold text-lg">{label}</span>
    </Link>
  );
};

export default TeacherDashboard;
