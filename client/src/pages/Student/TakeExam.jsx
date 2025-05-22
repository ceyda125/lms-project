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

  if (!exam) return <p className="text-center mt-8">Yükleniyor...</p>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-100 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{exam.title}</h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {exam.questions.map((q, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-md shadow-sm">
              <p className="font-semibold text-gray-800">{q.questionText}</p>

              {Array.isArray(q.options) && q.options.length > 0 ? (
                q.options.map((opt, i) => {
                  const optionLetter = String.fromCharCode(65 + i); // 'A', 'B', 'C', ...
                  return (
                    <label key={i} className="block mt-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={optionLetter}
                        onChange={() => handleAnswerChange(idx, optionLetter)}
                        className="mr-2"
                      />
                      {`${optionLetter}) ${opt}`}
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
            Cevapları Gönder
          </button>
        </form>
      </div>
    </div>
  );
}

export default TakeExam;
