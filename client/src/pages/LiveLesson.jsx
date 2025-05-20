import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

async function recordAttendance(lessonId, student) {
  // Önce dersi alıp öğretmen kontrolü yapalım
  const lessonRef = doc(db, "lessons", lessonId);
  const lessonSnap = await getDoc(lessonRef);
  if (!lessonSnap.exists()) return;

  const lessonData = lessonSnap.data();
  if (lessonData.teacherId === student.uid) {
    // Öğretmen ise yoklama kaydetme
    return;
  }

  const userRef = doc(db, `users/${student.uid}`);
  const userSnap = await getDoc(userRef);

  const studentName = userSnap.exists()
    ? userSnap.data().name || "Bilinmeyen"
    : "Bilinmeyen";

  const attendanceRef = doc(
    db,
    `lessons/${lessonId}/attendances/${student.uid}`
  );
  await setDoc(attendanceRef, {
    studentName,
    joinedAt: Timestamp.now(),
  });
}

function LiveLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    const fetchLesson = async () => {
      const docRef = doc(db, "lessons", lessonId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLesson({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate("/");
      }
    };
    fetchLesson();
  }, [lessonId, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      } else {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // isTeacher'ı doğrudan hesapla
  const isTeacher = lesson?.teacherId === currentUser?.uid;

  useEffect(() => {
    if (lesson && currentUser && jitsiContainerRef.current) {
      const domain = "meet.jit.si";
      const options = {
        roomName: lesson.roomName || lessonId,
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName: currentUser.displayName || "Katılımcı" },
        width: "100%",
        height: 600,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      if (!isTeacher) {
        recordAttendance(lessonId, currentUser);
      }

      return () => api.dispose();
    }
  }, [lesson, currentUser, lessonId, isTeacher]);

  if (!lesson) {
    return <div className="p-4 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4 text-center">{lesson.title}</h2>
      <div
        id="jitsi-container"
        ref={jitsiContainerRef}
        style={{
          height: "calc(100vh - 120px)",
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      ></div>
    </div>
  );
}

export default LiveLesson;
