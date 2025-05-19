import { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";

function CreateLesson({ user }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [lessonId, setLessonId] = useState(null);

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
      setLessonId(docRef.id);
      setTitle("");
      setDate("");
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-xl shadow-xl text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">🎓 Ders Oluştur</h2>
      <input
        type="text"
        placeholder="Ders Başlığı"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 mb-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white bg-white bg-opacity-10 placeholder-white"
      />
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-4 mb-6 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white bg-white bg-opacity-10"
      />
      <button
        onClick={handleCreateLesson}
        className="bg-yellow-500 text-white px-6 py-3 rounded-xl w-full hover:bg-yellow-400 transition"
      >
        Oluştur
      </button>
      <div className="mt-4 text-center">
        {lessonId && (
          <Link
            to={`/live-lesson/${lessonId}`}
            className="underline text-yellow-200 hover:text-yellow-100"
          >
            Derse Katıl
          </Link>
        )}
      </div>
    </div>
  );
}

export default CreateLesson;
