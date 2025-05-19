import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import StudentDashboard from "../pages/Student/StudentDashboard";
import { useNavigate } from "react-router-dom";

function App({ user, role }) {
  const navigate = useNavigate();

  if (!role) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div>
      {role === "teacher" && <TeacherDashboard user={user} />}
      {role === "student" && <StudentDashboard user={user} />}
    </div>
  );
}

export default App;
