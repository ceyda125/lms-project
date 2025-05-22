import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function MyLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, "lessons"),
        where("teacherId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLessons(data);
    };
    fetchLessons();
  }, []);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleJoin = (lessonId) => {
    navigate(`/live-lesson/${lessonId}`);
  };

  const isTodayOrFuture = (firebaseDate) => {
    if (!firebaseDate) return false;
    const now = new Date();
    const lessonDate = firebaseDate.toDate();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lessonDay = new Date(
      lessonDate.getFullYear(),
      lessonDate.getMonth(),
      lessonDate.getDate()
    );
    return lessonDay.getTime() === today.getTime();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-indigo-800 text-center">
          Oluşturduğum Canlı Dersler
        </h2>

        {lessons.length === 0 ? (
          <p className="text-center text-gray-500">Henüz ders oluşturulmadı.</p>
        ) : (
          <ul className="space-y-6">
            {lessons.map((lesson) => {
              const lessonDate = lesson.date?.toDate();
              const isToday = isTodayOrFuture(lesson.date);
              return (
                <li
                  key={lesson.id}
                  className="border border-indigo-200 rounded-lg p-5 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-700">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-600">
                      Tarih:{" "}
                      {lessonDate ? formatDate(lessonDate) : "Bilinmiyor"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleJoin(lesson.id)}
                    disabled={!isToday}
                    className={`px-5 py-2 rounded-md font-semibold text-white transition ${
                      isToday
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Katıl
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyLessonsPage;
