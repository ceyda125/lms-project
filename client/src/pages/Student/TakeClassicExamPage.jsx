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
        teacherId: exam.teacherId,
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

  if (!exam) return <p className="text-center mt-8">Yükleniyor...</p>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-100 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Klasik Sınav: {exam.title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {exam.questions.map((q, i) => (
            <div key={i}>
              <p className="font-semibold text-gray-800">
                {i + 1}. {q.questionText}
              </p>
              <textarea
                required
                value={answers[i]}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                className="w-full border rounded p-3 mt-2"
                rows={4}
                placeholder="Cevabınızı buraya yazınız..."
              />
            </div>
          ))}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Cevapları Gönder
          </button>
        </form>
      </div>
    </div>
  );
}

export default TakeClassicExamPage;
