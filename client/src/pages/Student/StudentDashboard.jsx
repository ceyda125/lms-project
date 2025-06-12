import { Link } from "react-router-dom";
import {
  VideoCameraIcon,
  ClipboardCheckIcon,
  StarIcon,
} from "@heroicons/react/outline";

function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3 justify-center">
          👨‍🎓 Öğrenci Paneli
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/live-lessons"
            className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <VideoCameraIcon className="w-12 h-12 text-indigo-600 mb-3" />
            <span className="text-indigo-800 font-semibold text-lg text-center">
              Canlı Derslerim
            </span>
          </Link>

          <Link
            to="/view-video"
            className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <VideoCameraIcon className="w-12 h-12 text-indigo-600 mb-3" />
            <span className="text-indigo-800 font-semibold text-lg text-center">
              Videoları Görüntüle
            </span>
          </Link>

          <Link
            to="/exams"
            className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <ClipboardCheckIcon className="w-12 h-12 text-indigo-600 mb-3" />
            <span className="text-indigo-800 font-semibold text-lg text-center">
              Sınavlara Katıl
            </span>
          </Link>

          <Link
            to="/grades"
            className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <StarIcon className="w-12 h-12 text-indigo-600 mb-3" />
            <span className="text-indigo-800 font-semibold text-lg text-center">
              Notlarım
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
