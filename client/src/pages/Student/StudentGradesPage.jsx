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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        📊 Sınav Notlarım
      </h2>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-2 text-blue-700">
            Klasik Sınavlar
          </h3>
          {classicResults.length > 0 ? (
            <ul className="mb-6">
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
                  <li
                    key={result.id}
                    className="border p-4 mb-2 rounded bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">{title}</span>
                      <span className="text-sm text-gray-500">{date}</span>
                    </div>
                    <p className="text-gray-800">Toplam Puan: {totalScore}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 mb-6">
              Klasik sınav sonucu bulunamadı.
            </p>
          )}

          <h3 className="text-xl font-semibold mb-2 text-green-700">
            Test Sınavları
          </h3>
          {testResults.length > 0 ? (
            <ul>
              {testResults.map((result) => {
                const date = result.createdAt
                  ?.toDate()
                  .toLocaleDateString("tr-TR");
                const title = examTitles[result.examId] || "Yükleniyor...";
                const percentage = result.total
                  ? Math.round((result.score / result.total) * 100)
                  : 0;

                return (
                  <li
                    key={result.id}
                    className="border p-4 mb-2 rounded bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">{title}</span>
                      <span className="text-sm text-gray-500">{date}</span>
                    </div>
                    <p className="text-gray-800">Puan: %{percentage}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">Test sınav sonucu bulunamadı.</p>
          )}
        </>
      )}
    </div>
  );
}

export default StudentGradesPage;
