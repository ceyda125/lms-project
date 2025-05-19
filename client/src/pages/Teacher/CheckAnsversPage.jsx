import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
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
        where("teacherId", "==", auth.currentUser.uid) // teacherId'ye göre filtreleme
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
      setLoading(false);
    };
    fetchSubmissions();
  }, []);

  const handleScoreChange = (submissionIndex, answerIndex, field, value) => {
    const updatedSubmissions = [...submissions];
    const answer = updatedSubmissions[submissionIndex].answers[answerIndex];
    if (field === "score") {
      answer.score = value === "" ? null : Number(value);
    } else if (field === "isCorrect") {
      answer.isCorrect = value === "" ? null : value === "true";
    }
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

  if (loading) return <p>Yükleniyor...</p>;

  if (submissions.length === 0) return <p>Değerlendirilecek cevap yok.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        Öğrenci Cevaplarını Değerlendir
      </h2>

      {submissions.map((submission, si) => (
        <div key={submission.id} className="mb-8 border p-4 rounded shadow">
          <h3 className="font-semibold mb-2">
            Öğrenci: {submission.studentId} — Sınav ID: {submission.examId}
          </h3>
          {submission.answers.map((answer, ai) => (
            <div key={ai} className="mb-4 bg-gray-50 p-3 rounded">
              <p className="font-semibold">
                {ai + 1}. {answer.questionText}
              </p>
              <p>
                <strong>Öğrenci Cevabı:</strong> {answer.studentAnswer}
              </p>

              <label className="mr-2">
                Puan:
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={answer.score ?? ""}
                  onChange={(e) =>
                    handleScoreChange(si, ai, "score", e.target.value)
                  }
                  className="ml-2 border rounded w-20 p-1"
                />
              </label>
            </div>
          ))}

          <button
            onClick={() => handleSaveEvaluation(submissions[si])}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Değerlendirmeyi Kaydet
          </button>
        </div>
      ))}
    </div>
  );
}

export default CheckAnswersPage;
