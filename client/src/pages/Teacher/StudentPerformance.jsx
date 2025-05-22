import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { Users, BarChart2, UserCheck2, ClipboardList } from "lucide-react";

function StudentPerformance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setTeacherId(user.uid);
    }
  }, []);

  const getExamTitle = async (examId) => {
    try {
      const examDoc = await getDoc(doc(db, "exams", examId));
      if (examDoc.exists()) {
        return examDoc.data().title || "Sınav";
      }
    } catch (e) {
      console.warn("Sınav adı alınamadı:", e);
    }
    return "Sınav";
  };

  useEffect(() => {
    if (!teacherId) return;

    const fetchStudentData = async () => {
      try {
        const studentMap = {};
        const lessonsSnapshot = await getDocs(
          query(collection(db, "lessons"), where("teacherId", "==", teacherId))
        );
        const totalLessonsCount = lessonsSnapshot.size;

        const testSnapshot = await getDocs(
          query(collection(db, "examResults"))
        );
        for (const docSnap of testSnapshot.docs) {
          const data = docSnap.data();
          if (data.teacherId !== teacherId) continue;

          const studentId = data.studentId;
          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              testScores: [],
              classicScores: [],
              attendanceCount: 0,
            };
          }

          const score = ((data.score / (data.total || 1)) * 100).toFixed(0);
          const title = await getExamTitle(data.examId);

          studentMap[studentId].testScores.push({
            examName: title,
            score: Number(score),
          });
        }

        const classicSnapshot = await getDocs(
          query(
            collection(db, "examAnswers"),
            where("teacherId", "==", teacherId)
          )
        );
        for (const docSnap of classicSnapshot.docs) {
          const data = docSnap.data();
          const studentId = data.studentId;
          const totalScore = (data.answers || [])
            .map((a) => a.score)
            .filter((s) => typeof s === "number")
            .reduce((a, b) => a + b, 0);
          const title = await getExamTitle(data.examId);

          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              testScores: [],
              classicScores: [],
              attendanceCount: 0,
            };
          }

          studentMap[studentId].classicScores.push({
            examName: title,
            score: totalScore,
          });
        }

        for (const lessonDoc of lessonsSnapshot.docs) {
          const lessonId = lessonDoc.id;
          const attendanceSnapshot = await getDocs(
            collection(db, `lessons/${lessonId}/attendances`)
          );
          attendanceSnapshot.forEach((attendanceDoc) => {
            const studentId = attendanceDoc.id;
            if (!studentMap[studentId]) {
              studentMap[studentId] = {
                testScores: [],
                classicScores: [],
                attendanceCount: 0,
              };
            }
            studentMap[studentId].attendanceCount++;
          });
        }

        const result = await Promise.all(
          Object.entries(studentMap).map(async ([studentId, data]) => {
            let studentName = studentId;
            try {
              const userDoc = await getDoc(doc(db, "users", studentId));
              if (userDoc.exists()) {
                studentName = userDoc.data().name || studentId;
              }
            } catch (e) {
              console.warn("Öğrenci adı alınamadı:", e);
            }

            const allScores = [
              ...data.testScores.map((t) => t.score),
              ...data.classicScores.map((c) => c.score),
            ];
            const overallAvg = allScores.length
              ? (
                  allScores.reduce((a, b) => a + b, 0) / allScores.length
                ).toFixed(1)
              : "-";

            const attendancePercent =
              totalLessonsCount > 0
                ? ((data.attendanceCount / totalLessonsCount) * 100).toFixed(0)
                : "-";

            return {
              studentId,
              studentName,
              testScores: data.testScores,
              classicScores: data.classicScores,
              overallAvg,
              attendanceCount: data.attendanceCount,
              totalLessonsCount,
              attendancePercent,
            };
          })
        );

        setStudents(result);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-indigo-600 text-lg font-medium">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        <Users className="w-7 h-7 text-indigo-600" />
        Öğrenci Performansları
      </h2>

      <div className="space-y-6">
        {students.map((student) => (
          <div
            key={student.studentId}
            className="bg-white rounded-xl shadow p-6 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{student.studentName}</h3>
              <span className="text-green-600 font-medium">
                Genel Ortalama: {student.overallAvg}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Test Sınavları */}
              <div>
                <h4 className="text-indigo-700 font-semibold mb-2 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Test Sınavları
                </h4>
                <ul className="text-sm space-y-1">
                  {student.testScores.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-gray-200 pb-1"
                    >
                      <span>{item.examName}</span>
                      <span className="text-indigo-600 font-medium">
                        {item.score}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Klasik Sınavlar */}
              <div>
                <h4 className="text-indigo-700 font-semibold mb-2 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Klasik Sınavlar
                </h4>
                <ul className="text-sm space-y-1">
                  {student.classicScores.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-gray-200 pb-1"
                    >
                      <span>{item.examName}</span>
                      <span className="text-indigo-600 font-medium">
                        {item.score}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Katılım Bilgisi */}
              <div>
                <h4 className="text-indigo-700 font-semibold mb-2 flex items-center gap-2">
                  <UserCheck2 className="w-4 h-4" />
                  Katılım Bilgisi
                </h4>
                <p className="text-sm">
                  Katıldığı Ders: {student.attendanceCount}
                </p>
                <p className="text-sm">
                  Toplam Ders: {student.totalLessonsCount}
                </p>
                <p className="text-sm">
                  Katılım Oranı:{" "}
                  <span className="text-green-600 font-medium">
                    {student.attendancePercent}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentPerformance;
