import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

function TakeClassicExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      const docRef = doc(db, "exams", examId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setExam(docSnap.data());
        setAnswers(docSnap.data().questions.map(() => ""));
      }
    };
    fetchExam();
  }, [examId]);

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Lütfen giriş yapınız.");
      return;
    }

    if (!exam) {
      alert("Sınav yüklenemedi.");
      return;
    }

    const answersToSave = exam.questions.map((q, i) => ({
      questionText: q.questionText,
      studentAnswer: answers[i] || "",
      score: null,
      isCorrect: null,
    }));

    try {
      await addDoc(collection(db, "examAnswers"), {
        studentId: currentUser.uid,
        examId,
        teacherId: exam.teacherId, // Burada teacherId ekleniyor
        answers: answersToSave,
        submittedAt: Timestamp.now(),
      });
      alert("Cevaplarınız gönderildi.");
      navigate("/student-dashboard");
    } catch (err) {
      console.error(err);
      alert("Gönderim sırasında hata oluştu.");
    }
  };

  if (!exam) return <p>Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Klasik Sınav: {exam.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {exam.questions.map((q, i) => (
          <div key={i} className="mb-4">
            <p className="font-semibold">
              {i + 1}. {q.questionText}
            </p>
            <textarea
              required
              value={answers[i]}
              onChange={(e) => handleAnswerChange(i, e.target.value)}
              className="w-full border rounded p-2"
              rows={4}
              placeholder="Cevabınızı buraya yazınız"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Cevapları Gönder
        </button>
      </form>
    </div>
  );
}

export default TakeClassicExamPage;
