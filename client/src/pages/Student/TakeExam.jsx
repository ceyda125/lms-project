// pages/TakeExam.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

function TakeExam() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      const docRef = doc(db, "exams", examId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setExam(docSnap.data());
      }
    };
    fetchExam();
  }, [examId]);

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !exam) return;

    let score = 0;

    if (exam.type === "test") {
      exam.questions.forEach((q, idx) => {
        const correct = q.correctAnswer?.toLowerCase();
        const userAnswer = answers[idx]?.toLowerCase();
        if (correct === userAnswer) {
          score += 1;
        }
      });
    }

    const result = {
      studentId: currentUser.uid,
      examId,
      answers,
      score,
      total: exam.questions.length,
      createdAt: new Date(),
      teacherId: exam.teacherId,
    };

    await setDoc(
      doc(db, "examResults", `${examId}_${currentUser.uid}`),
      result
    );

    alert("Cevaplarınız gönderildi.");
    navigate("/student-dashboard");
  };

  if (!exam) return <p>Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{exam.title}</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {exam.questions.map((q, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{q.questionText}</p>

            {Array.isArray(q.options) && q.options.length > 0 ? (
              q.options.map((opt, i) => {
                const optionLetter = String.fromCharCode(65 + i); // 65 = 'A'
                return (
                  <label key={i} className="block mt-2">
                    <input
                      type="radio"
                      name={`q${idx}`}
                      value={optionLetter}
                      onChange={() => handleAnswerChange(idx, optionLetter)}
                      className="mr-2"
                    />
                    <span>{`${optionLetter}) ${opt}`}</span>
                  </label>
                );
              })
            ) : (
              <textarea
                className="w-full border p-2 mt-2 rounded"
                rows={3}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}

export default TakeExam;
