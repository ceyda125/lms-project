import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { BarChart2, ClipboardList } from "lucide-react";

function StudentGradesPage() {
  const [classicResults, setClassicResults] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [examTitles, setExamTitles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const classicQuery = query(
          collection(db, "examAnswers"),
          where("studentId", "==", currentUser.uid)
        );
        const classicSnapshot = await getDocs(classicQuery);
        const classicData = classicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const testQuery = query(
          collection(db, "examResults"),
          where("studentId", "==", currentUser.uid)
        );
        const testSnapshot = await getDocs(testQuery);
        const testData = testSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClassicResults(classicData);
        setTestResults(testData);

        const examIds = [
          ...new Set([
            ...classicData.map((r) => r.examId),
            ...testData.map((r) => r.examId),
          ]),
        ];

        const titlesMap = {};
        await Promise.all(
          examIds.map(async (examId) => {
            try {
              const examDoc = await getDoc(doc(db, "exams", examId));
              if (examDoc.exists()) {
                titlesMap[examId] = examDoc.data().title || "Başlıksız";
              } else {
                titlesMap[examId] = "Bilinmeyen Sınav";
              }
            } catch {
              titlesMap[examId] = "Sınav alınamadı";
            }
          })
        );

        setExamTitles(titlesMap);
      } catch (error) {
        console.error("Notlar alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        <ClipboardList className="w-7 h-7 text-green-600" />
        Sınav Notlarım
      </h2>

      {loading ? (
        <div className="text-center text-gray-600">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Klasik Sınav Kartları */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 className="text-green-500" />
              Klasik Sınavlar
            </h3>
            {classicResults.length > 0 ? (
              <div className="space-y-3">
                {classicResults.map((result) => {
                  const date = result.submittedAt
                    ?.toDate()
                    .toLocaleDateString("tr-TR");
                  const totalScore = result.answers.reduce(
                    (acc, q) => acc + (q.score || 0),
                    0
                  );
                  const title = examTitles[result.examId] || "Yükleniyor...";
                  return (
                    <div
                      key={result.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow transition"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">
                          {title}
                        </span>
                        <span className="text-sm text-gray-500">{date}</span>
                      </div>
                      <div className="text-gray-700">
                        Toplam Puan:{" "}
                        <span className="font-semibold text-green-600">
                          {totalScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Klasik sınav sonucu bulunamadı.</p>
            )}
          </div>

          {/* Test Sınav Kartları */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 className="text-green-500" />
              Test Sınavları
            </h3>
            {testResults.length > 0 ? (
              <div className="space-y-3">
                {testResults.map((result) => {
                  const date = result.createdAt
                    ?.toDate()
                    .toLocaleDateString("tr-TR");
                  const title = examTitles[result.examId] || "Yükleniyor...";
                  const percentage = result.total
                    ? Math.round((result.score / result.total) * 100)
                    : 0;

                  return (
                    <div
                      key={result.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow transition"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">
                          {title}
                        </span>
                        <span className="text-sm text-gray-500">{date}</span>
                      </div>
                      <div className="text-gray-700">
                        Başarı Oranı:{" "}
                        <span className="font-semibold text-green-600">
                          {percentage}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Test sınav sonucu bulunamadı.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentGradesPage;
