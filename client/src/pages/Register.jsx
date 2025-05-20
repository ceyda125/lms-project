import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const navigate = useNavigate();

  // Eğer öğrenci seçilirse öğretmenleri getir
  useEffect(() => {
    const fetchTeachers = async () => {
      if (role === "student") {
        const querySnapshot = await getDocs(collection(db, "users"));
        const teachers = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().role === "teacher") {
            teachers.push({
              id: doc.id,
              name: doc.data().name || doc.data().email,
            });
          }
        });
        setTeacherList(teachers);
      } else {
        setTeacherList([]);
        setSelectedTeacher("");
      }
    };

    fetchTeachers();
  }, [role]);

  const handleRegister = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
        name,
        teacherId: role === "student" ? selectedTeacher : null,
      });

      alert("Kayıt başarılı!");
      navigate("/login");
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Kayıt Ol</h2>

        <input
          type="text"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          required
        >
          <option value="">Rol Seçiniz</option>
          <option value="student">Öğrenci</option>
          <option value="teacher">Öğretmen</option>
        </select>

        {role === "student" && (
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            required
          >
            <option value="">Öğretmen Seçiniz</option>
            {teacherList.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleRegister}
          className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
        >
          Kayıt Ol
        </button>
      </div>
    </div>
  );
}

export default Register;
