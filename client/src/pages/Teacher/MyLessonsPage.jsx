import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function MyLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
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
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Oluşturduğum Canlı Dersler</h2>
      <ul className="space-y-4">
        {lessons.map((lesson) => {
          const lessonDate = lesson.date?.toDate();
          const isToday = isTodayOrFuture(lesson.date);
          return (
            <li key={lesson.id} className="bg-white p-4 rounded shadow">
              <h4 className="text-xl font-semibold">{lesson.title}</h4>
              <p className="text-gray-600 mb-2">
                Tarih: {formatDate(lessonDate)}
              </p>
              <button
                onClick={() => handleJoin(lesson.id)}
                disabled={!isToday}
                className={`px-4 py-2 rounded text-white font-semibold transition ${
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
    </div>
  );
}

export default MyLessonsPage;
