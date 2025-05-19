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
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        📅 Canlı Derslerim
      </h2>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : lessons.length > 0 ? (
        <ul className="space-y-4">
          {lessons.map((lesson) => {
            const lessonDate = lesson.date?.toDate?.() || new Date(lesson.date);
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
                className="p-4 border rounded-md shadow-sm bg-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg">{lesson.title}</h4>
                  <span className="text-sm text-gray-600">
                    {lessonDate.toLocaleString("tr-TR")}
                  </span>
                </div>

                {isOngoing ? (
                  <Link
                    to={`/live-lesson/${lesson.id}`}
                    className="text-green-600 font-semibold underline hover:text-green-800"
                  >
                    Derse Katıl
                  </Link>
                ) : isFuture ? (
                  <span className="text-gray-500">Henüz başlamadı</span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    Süresi Geçti
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Kayıtlı canlı ders bulunamadı.</p>
      )}
    </div>
  );
}

export default LiveLessonsPage;
