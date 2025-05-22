import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

function CheckAnswersPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, "examAnswers"),
        where("teacherId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Öğrenci adları ve sınav başlıklarını çek
      const enrichedData = await Promise.all(
        rawData.map(async (item) => {
          let studentName = item.studentId;
          let examTitle = item.examId;

          try {
            const studentDoc = await getDoc(doc(db, "users", item.studentId));
            if (studentDoc.exists()) {
              studentName = studentDoc.data().name || studentName;
            }
          } catch (err) {
            console.warn("Öğrenci adı alınamadı:", err);
          }

          try {
            const examDoc = await getDoc(doc(db, "exams", item.examId));
            if (examDoc.exists()) {
              examTitle = examDoc.data().title || examTitle;
            }
          } catch (err) {
            console.warn("Sınav başlığı alınamadı:", err);
          }

          return {
            ...item,
            studentName,
            examTitle,
          };
        })
      );

      setSubmissions(enrichedData);
      setLoading(false);
    };

    fetchSubmissions();
  }, []);

  const handleScoreChange = (submissionIndex, answerIndex, value) => {
    const updatedSubmissions = [...submissions];
    updatedSubmissions[submissionIndex].answers[answerIndex].score =
      value === "" ? null : Number(value);
    setSubmissions(updatedSubmissions);
  };

  const handleSaveEvaluation = async (submission) => {
    const submissionRef = doc(db, "examAnswers", submission.id);
    try {
      await updateDoc(submissionRef, {
        answers: submission.answers,
      });
      alert("Değerlendirme kaydedildi.");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600 text-lg">Yükleniyor...</p>
      </div>
    );

  if (submissions.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600 text-lg">Değerlendirilecek cevap yok.</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-5xl w-full p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Öğrenci Cevaplarını Değerlendir
        </h2>

        {submissions.map((submission, si) => (
          <div
            key={submission.id}
            className="mb-8 border border-gray-200 p-6 rounded-lg shadow-sm"
          >
            <h3 className="font-semibold mb-4 text-gray-700">
              Öğrenci:{" "}
              <span className="font-normal">{submission.studentName}</span> —{" "}
              Sınav: <span className="font-normal">{submission.examTitle}</span>
            </h3>

            {submission.answers.map((answer, ai) => (
              <div
                key={ai}
                className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-300"
              >
                <p className="font-semibold text-gray-800 mb-1">
                  {ai + 1}. {answer.questionText}
                </p>
                <p className="mb-2">
                  <strong>Öğrenci Cevabı:</strong> {answer.studentAnswer}
                </p>

                <label className="flex items-center space-x-2">
                  <span>Puan:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={answer.score ?? ""}
                    onChange={(e) => handleScoreChange(si, ai, e.target.value)}
                    className="w-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>
            ))}

            <button
              onClick={() => handleSaveEvaluation(submissions[si])}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md px-6 py-2 transition"
            >
              Değerlendirmeyi Kaydet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CheckAnswersPage;
