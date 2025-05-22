import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

function MyExamsPage() {
  const [exams, setExams] = useState([]);
  const [selectedExamTitle, setSelectedExamTitle] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, "exams"),
        where("teacherId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExams(data);
    };
    fetchExams();
  }, []);

  const handleShowQuestions = async (examId) => {
    const docRef = doc(db, "exams", examId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const examData = docSnap.data();
      setSelectedExamTitle(examData.title);
      setQuestions(examData.questions || []);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setQuestions([]);
    setSelectedExamTitle(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-5xl w-full p-8 bg-white rounded-xl shadow-md text-gray-800">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Oluşturduğum Sınavlar
        </h2>
        <ul className="space-y-5">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              <h4 className="text-xl font-semibold mb-1">{exam.title}</h4>
              <p className="mb-1">Tür: {exam.type}</p>
              <p className="mb-3 text-gray-600 text-sm">
                Oluşturulma:{" "}
                {exam.createdAt?.toDate().toLocaleString() || "Bilinmiyor"}
              </p>
              <button
                onClick={() => handleShowQuestions(exam.id)}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition"
              >
                Soruları Görüntüle
              </button>
            </li>
          ))}
        </ul>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[80vh] relative shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-center text-gray-900">
                "{selectedExamTitle}" Sınavının Soruları
              </h3>
              <ul className="space-y-4 text-gray-800">
                {questions.length > 0 ? (
                  questions.map((q, index) => (
                    <li key={index} className="bg-gray-100 p-4 rounded shadow">
                      <p className="font-semibold mb-2">
                        Soru {index + 1}: {q.questionText}
                      </p>
                      {q.options && (
                        <ul className="list-disc pl-6 space-y-1">
                          {q.options.map((opt, i) => {
                            const optionLabel = String.fromCharCode(65 + i); // A, B, C, D
                            return (
                              <li key={i} className="text-gray-700">
                                {optionLabel} {opt}{" "}
                                {optionLabel === q.correctAnswer && (
                                  <span className="text-green-600 font-bold">
                                    (Doğru)
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <p className="text-center text-gray-600">Soru bulunamadı.</p>
                )}
              </ul>
              <button
                onClick={closeModal}
                className="mt-6 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyExamsPage;
