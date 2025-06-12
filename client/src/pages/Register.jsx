import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth , db} from "../firebase/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { LockClosedIcon } from "@heroicons/react/solid";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <LockClosedIcon className="h-10 w-10 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          SmartLMS Kayıt
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Lütfen bilgilerinizi doldurun.
        </p>

        <input
          type="text"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md transition duration-300"
        >
          Kayıt Ol
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Zaten hesabın var mı?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
