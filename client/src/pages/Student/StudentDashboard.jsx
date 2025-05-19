import { Link } from "react-router-dom";
import {
  VideoCameraIcon,
  ClipboardCheckIcon,
  StarIcon,
} from "@heroicons/react/outline";

function StudentDashboard() {
  return (
    <div className="max-w-3xl mx-auto p-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-lg shadow-xl text-white">
      <h2 className="text-3xl font-bold mb-4 text-center">👨‍🎓 Öğrenci Paneli</h2>

      <div className="space-y-4 mb-6">
        <Link
          to="/live-lessons"
          className="flex items-center space-x-2 text-lg hover:text-yellow-300 cursor-pointer transition"
        >
          <VideoCameraIcon className="w-6 h-6" />
          <span>Canlı Derslerim</span>
        </Link>
        <Link
          to="/exams"
          className="flex items-center space-x-2 text-lg hover:text-yellow-300 cursor-pointer transition"
        >
          <ClipboardCheckIcon className="w-6 h-6" />
          <span>Sınavlara Katıl</span>
        </Link>

        <Link
          to="/grades"
          className="flex items-center space-x-2 text-lg hover:text-yellow-300 cursor-pointer transition"
        >
          <StarIcon className="w-6 h-6" />
          <span>Notlarım</span>
        </Link>
      </div>
    </div>
  );
}

export default StudentDashboard;
