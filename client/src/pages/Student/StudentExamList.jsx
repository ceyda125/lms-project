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
import { ClipboardList } from "lucide-react";

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
      testSnap.docs.forEach((doc) => takenIds.add(doc.data().examId));
      classicSnap.docs.forEach((doc) => takenIds.add(doc.data().examId));

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
    <div className="min-h-screen p-6 md:p-10 bg-gray-100 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-green-600" />
          Katılabileceğin Sınavlar
        </h2>

        {exams.length === 0 ? (
          <p className="text-gray-600 text-center">Sınav bulunamadı.</p>
        ) : (
          <ul className="space-y-4">
            {exams.map((exam) => {
              const alreadyTaken = takenExamIds.has(exam.id);
              return (
                <li
                  key={exam.id}
                  className={`p-5 rounded-xl shadow-md transition ${
                    alreadyTaken
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-white hover:shadow-lg cursor-pointer"
                  }`}
                  onClick={() => !alreadyTaken && handleGoToExam(exam)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {exam.title}
                    </h4>
                    {alreadyTaken ? (
                      <span className="text-gray-500 italic">
                        Zaten Katıldın
                      </span>
                    ) : (
                      <button
                        className="text-green-600 font-semibold hover:underline"
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
        )}
      </div>
    </div>
  );
}

export default StudentExamList;
