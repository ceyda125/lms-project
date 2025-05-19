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
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Oluşturduğum Sınavlar</h2>
      <ul className="space-y-4">
        {exams.map((exam) => (
          <li key={exam.id} className="bg-white p-4 rounded shadow">
            <h4 className="text-xl font-semibold">{exam.title}</h4>
            <p>Tür: {exam.type}</p>
            <p>Oluşturulma: {exam.createdAt?.toDate().toLocaleString()}</p>
            <button
              onClick={() => handleShowQuestions(exam.id)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Soruları Görüntüle
            </button>
          </li>
        ))}
      </ul>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[80vh] relative">
            <h3 className="text-xl font-bold mb-4 text-center">
              "{selectedExamTitle}" Sınavının Soruları
            </h3>
            <ul className="space-y-4">
              {questions.length > 0 ? (
                questions.map((q, index) => (
                  <li
                    key={index}
                    className="bg-gray-100 p-4 rounded shadow text-black"
                  >
                    <p className="font-semibold">
                      Soru {index + 1}: {q.questionText}
                    </p>
                    {q.options && (
                      <ul className="list-disc pl-6 mt-2">
                        {q.options.map((opt, i) => {
                          const optionLabel = String.fromCharCode(65 + i); // A, B, C, D
                          return (
                            <li key={i}>
                              {optionLabel}) {opt}{" "}
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
                <p>Soru bulunamadı.</p>
              )}
            </ul>
            <button
              onClick={closeModal}
              className="mt-6 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyExamsPage;
