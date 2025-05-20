import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

function StudentPerformance() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentRef = doc(db, "users", studentId);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          console.warn("Kullanıcı bulunamadı.");
          navigate("/teacher-dashboard");
          return;
        }

        const student = studentSnap.data();
        if (student.role !== "student") {
          console.warn("Bu kullanıcı öğrenci değil.");
          navigate("/teacher-dashboard");
          return;
        }

        setStudentData(student);

        // Tüm dersleri getir
        const lessonsSnap = await getDocs(collection(db, "lessons"));
        const attendanceList = [];

        for (const lessonDoc of lessonsSnap.docs) {
          const lessonId = lessonDoc.id;
          const lessonData = lessonDoc.data();

          const attendanceDocRef = doc(
            db,
            `lessons/${lessonId}/attendances/${studentId}`
          );
          const attendanceDocSnap = await getDoc(attendanceDocRef);

          if (attendanceDocSnap.exists()) {
            const attendanceData = attendanceDocSnap.data();
            attendanceList.push({
              lessonId: lessonId,
              lessonTitle: lessonData.title,
              studentName: attendanceData.studentName,
              joinedAt: attendanceData.joinedAt?.toDate(),
            });
          } else {
            attendanceList.push({
              lessonId: lessonId,
              lessonTitle: lessonData.title,
              studentName: student.displayName,
              joinedAt: null, // Katılmamış
            });
          }
        }

        setAttendanceData(attendanceList);
      } catch (error) {
        console.error("Veriler alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, navigate]);

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
        🧑‍🎓 Öğrenci Performansı
      </h3>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-pulse bg-white h-4 w-32 rounded-md"></div>
        </div>
      ) : studentData ? (
        <div>
          <h4 className="text-2xl font-semibold mb-4">
            {studentData.displayName}'in Performansı
          </h4>
          <ul className="space-y-4">
            {attendanceData.length > 0 ? (
              attendanceData.map((attendance) => (
                <li
                  key={attendance.lessonId}
                  className="bg-white text-black p-4 rounded-lg shadow-lg transition transform hover:scale-105"
                >
                  <h5 className="text-xl font-semibold">
                    {attendance.lessonTitle || "Bilinmeyen Ders"}
                  </h5>
                  <p>
                    {attendance.joinedAt
                      ? `Katıldı: ${formatDate(attendance.joinedAt)}`
                      : "Katılmadı"}
                  </p>
                  <Link
                    to={`/live-lesson/${attendance.lessonId}`}
                    className="text-green-600 underline hover:text-green-800"
                  >
                    Derse Katıl
                  </Link>
                </li>
              ))
            ) : (
              <p className="text-white">Bu öğrenciye ait ders bulunamadı.</p>
            )}
          </ul>
        </div>
      ) : (
        <p className="text-white">Öğrenci verisi bulunamadı.</p>
      )}
    </div>
  );
}

export default StudentPerformance;
