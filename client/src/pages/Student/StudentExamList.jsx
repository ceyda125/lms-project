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
import { useNavigate } from "react-router-dom";

function StudentExamList() {
  const [exams, setExams] = useState([]);
  const [takenExamIds, setTakenExamIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const studentDoc = await getDoc(doc(db, "users", currentUser.uid));
      const teacherId = studentDoc.data()?.teacherId;

      if (!teacherId) {
        setExams([]);
        return;
      }

      // Öğrenciye ait sınavları al
      const q = query(
        collection(db, "exams"),
        where("teacherId", "==", teacherId)
      );
      const snapshot = await getDocs(q);
      const examList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExams(examList);

      const testResultsQuery = query(
        collection(db, "examResults"),
        where("studentId", "==", currentUser.uid)
      );
      const classicAnswersQuery = query(
        collection(db, "examAnswers"),
        where("studentId", "==", currentUser.uid)
      );

      const [testSnap, classicSnap] = await Promise.all([
        getDocs(testResultsQuery),
        getDocs(classicAnswersQuery),
      ]);

      const takenIds = new Set();
      testSnap.docs.forEach((doc) => {
        takenIds.add(doc.data().examId);
      });
      classicSnap.docs.forEach((doc) => {
        takenIds.add(doc.data().examId);
      });

      setTakenExamIds(takenIds);
    };

    fetchExams();
  }, []);

  const handleGoToExam = (exam) => {
    if (!exam.type) {
      alert("Sınav tipi belirlenmemiş!");
      return;
    }

    if (takenExamIds.has(exam.id)) {
      alert("Bu sınava zaten katıldınız.");
      return;
    }

    if (exam.type === "klasik") {
      navigate(`/take-classic-exam/${exam.id}`);
    } else if (exam.type === "test") {
      navigate(`/take-exam/${exam.id}`);
    } else {
      alert("Bilinmeyen sınav tipi!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Katılabileceğin Sınavlar</h2>
      <ul className="space-y-4">
        {exams.map((exam) => {
          const alreadyTaken = takenExamIds.has(exam.id);

          return (
            <li
              key={exam.id}
              className={`p-4 shadow rounded transition ${
                alreadyTaken
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={() => {
                if (!alreadyTaken) handleGoToExam(exam);
              }}
            >
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">{exam.title}</h4>
                {alreadyTaken ? (
                  <span className="text-gray-500 italic">Zaten Katıldın</span>
                ) : (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoToExam(exam);
                    }}
                  >
                    Sınava Katıl
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default StudentExamList;
