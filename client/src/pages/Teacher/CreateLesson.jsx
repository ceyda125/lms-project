import { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

function CreateLesson({ user }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [lessonId, setLessonId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const currentUserId = user?.uid || auth.currentUser?.uid;
      if (!currentUserId) return;
      try {
        const q = query(
          collection(db, "users"),
          where("teacherId", "==", currentUserId)
        );
        const querySnapshot = await getDocs(q);
        const studentList = [];
        querySnapshot.forEach((doc) => {
          studentList.push({ id: doc.id, ...doc.data() });
        });
        setStudents(studentList);
      } catch (err) {
        console.error("Öğrenciler alınırken hata:", err);
      }
    };
    fetchStudents();
  }, [user]);

  const handleCreateLesson = async () => {
    if (!title || !date) {
      alert("Lütfen başlık ve tarih girin");
      return;
    }
    try {
      const lessonDate = new Date(date);
      const currentUserId = user?.uid || auth.currentUser?.uid;
      const docRef = await addDoc(collection(db, "lessons"), {
        title,
        date: lessonDate,
        teacherId: currentUserId,
        roomName: `lesson-${Date.now()}`,
        students: students.map((s) => s.id),
      });
      alert("Ders başarıyla oluşturuldu!");
      navigate("/dashboard");
      setLessonId(docRef.id);
      setTitle("");
      setDate("");
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-5xl w-full p-8 bg-white rounded-xl shadow-md text-gray-800">
        <h2 className="text-3xl font-bold mb-8 text-center">🎓 Ders Oluştur</h2>

        <input
          type="text"
          placeholder="Ders Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 mb-6 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-4 mb-6 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleCreateLesson}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md px-6 py-3 w-full transition"
        >
          Oluştur
        </button>
      </div>
    </div>
  );
}

export default CreateLesson;
