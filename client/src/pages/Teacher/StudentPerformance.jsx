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

  useEffect(() => {
    if (!teacherId) return;

    const fetchStudentScoresAndAttendance = async () => {
      try {
        const studentMap = {};

        // 1) Toplam ders sayısını getir (teacherId'ye göre filtrele)
        const lessonsSnapshot = await getDocs(
          query(collection(db, "lessons"), where("teacherId", "==", teacherId))
        );
        const totalLessonsCount = lessonsSnapshot.size;

        // 2) TEST SINAVLARI
        const testSnapshot = await getDocs(
          query(collection(db, "examResults"))
        );
        testSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.teacherId !== teacherId) return;

          const studentId = data.studentId;
          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              testScores: [],
              classicScores: [],
              attendanceCount: 0, // yoklama için
            };
          }

          const totalQuestions = data.total || 1;
          const correctAnswers = data.score || 0;

          const percentageScore = (
            (correctAnswers / totalQuestions) *
            100
          ).toFixed(0);

          studentMap[studentId].testScores.push({
            examName: data.examName || "Test Sınavı",
            score: Number(percentageScore),
          });
        });

        // 3) KLASİK SINAVLAR
        const classicSnapshot = await getDocs(
          query(
            collection(db, "examAnswers"),
            where("teacherId", "==", teacherId)
          )
        );
        classicSnapshot.forEach((doc) => {
          const data = doc.data();
          const studentId = data.studentId;
          const totalScore = (data.answers || [])
            .map((a) => a.score)
            .filter((s) => typeof s === "number")
            .reduce((a, b) => a + b, 0);

          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              testScores: [],
              classicScores: [],
              attendanceCount: 0,
            };
          }

          studentMap[studentId].classicScores.push({
            examName: data.examName || "Klasik Sınav",
            score: totalScore,
          });
        });

        // 4) Yoklama sayısını öğrenci bazında say
        // lessons koleksiyonu içinde her dersin altındaki attendances alt koleksiyonundan yoklama var mı kontrol et
        for (const lessonDoc of lessonsSnapshot.docs) {
          const lessonId = lessonDoc.id;
          const attendanceSnapshot = await getDocs(
            collection(db, `lessons/${lessonId}/attendances`)
          );

          attendanceSnapshot.forEach((attendanceDoc) => {
            const attendanceData = attendanceDoc.data();
            const studentId = attendanceDoc.id; // attandance doküman ismi öğrenciId

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

        // 5) Sonuçları hazırla
        const result = await Promise.all(
          Object.entries(studentMap).map(async ([studentId, scores]) => {
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
              ...scores.testScores.map((t) => t.score),
              ...scores.classicScores.map((c) => c.score),
            ];

            const overallAvg = allScores.length
              ? (
                  allScores.reduce((a, b) => a + b, 0) / allScores.length
                ).toFixed(1)
              : "-";

            // Yoklama yüzdesi
            const attendancePercent =
              totalLessonsCount > 0
                ? ((scores.attendanceCount / totalLessonsCount) * 100).toFixed(
                    0
                  )
                : "-";

            return {
              studentId,
              studentName,
              testScores: scores.testScores,
              classicScores: scores.classicScores,
              overallAvg,
              attendanceCount: scores.attendanceCount,
              totalLessonsCount,
              attendancePercent,
            };
          })
        );

        setStudents(result);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentScoresAndAttendance();
  }, [teacherId]);

  if (loading) return <p className="p-4">Yükleniyor...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Öğrenci Sınav Performansları</h2>
      {students.map((student) => (
        <div
          key={student.studentId}
          className="mb-8 border border-gray-300 rounded-lg p-4 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{student.studentName}</h3>
            <div className="text-sm font-medium">
              Genel Ortalama: {student.overallAvg}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Test Sınavları */}
            <div>
              <h4 className="font-medium mb-2">Test Sınavları</h4>
              <ul className="space-y-1">
                {student.testScores.map((test, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between border-b pb-1 text-sm"
                  >
                    <span>{test.examName}</span>
                    <span>{test.score}%</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Klasik Sınavlar */}
            <div>
              <h4 className="font-medium mb-2">Klasik Sınavlar</h4>
              <ul className="space-y-1">
                {student.classicScores.map((classic, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between border-b pb-1 text-sm"
                  >
                    <span>{classic.examName}</span>
                    <span>{classic.score}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Yoklama */}
            <div>
              <h4 className="font-medium mb-2">Yoklama</h4>
              <p>Katıldığı Ders: {student.attendanceCount}</p>
              <p>Toplam Ders: {student.totalLessonsCount}</p>
              <p>Katılım Oranı: {student.attendancePercent}%</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentPerformance;
