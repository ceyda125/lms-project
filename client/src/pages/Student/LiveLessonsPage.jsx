import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

function LiveLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const studentDoc = await getDoc(doc(db, "users", currentUser.uid));
        const teacherId = studentDoc.data()?.teacherId;

        const q = query(
          collection(db, "lessons"),
          where("teacherId", "==", teacherId)
        );
        const snapshot = await getDocs(q);

        const studentLessons = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.students?.includes(currentUser.uid)) {
            studentLessons.push({ id: doc.id, ...data });
          }
        });

        setLessons(studentLessons);
      } catch (error) {
        console.error("Dersler alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const now = new Date();

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-100 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-7 h-7 text-green-600" />
          Canlı Derslerim
        </h2>

        {loading ? (
          <p className="text-gray-600 text-center">Yükleniyor...</p>
        ) : lessons.length === 0 ? (
          <p className="text-gray-600 text-center">
            Kayıtlı canlı ders bulunamadı.
          </p>
        ) : (
          <ul className="space-y-4">
            {lessons.map((lesson) => {
              let lessonDate;
              if (lesson.date && typeof lesson.date.toDate === "function") {
                lessonDate = lesson.date.toDate();
              } else {
                lessonDate = new Date(lesson.date);
              }

              const isOngoing =
                lessonDate <= now &&
                now.toDateString() === lessonDate.toDateString();
              const isFuture = lessonDate > now;
              const isPast =
                lessonDate < now &&
                now.toDateString() !== lessonDate.toDateString();

              return (
                <li
                  key={lesson.id}
                  className={`p-5 rounded-xl shadow-md transition ${
                    isPast ? "bg-gray-200" : "bg-white hover:shadow-lg"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {lesson.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {lessonDate.toLocaleString("tr-TR")}
                      </p>
                    </div>

                    {isOngoing ? (
                      <Link
                        to={`/live-lesson/${lesson.id}`}
                        className="text-green-600 font-semibold hover:underline"
                      >
                        Derse Katıl
                      </Link>
                    ) : isFuture ? (
                      <span className="text-gray-500 italic">
                        Henüz başlamadı
                      </span>
                    ) : (
                      <span className="text-red-500 italic">Süresi geçti</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default LiveLessonsPage;
