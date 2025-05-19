import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth"; // Burada import edilmesi gerekiyor
import { useNavigate } from "react-router-dom"; // navigate burada kullanılacak

async function recordAttendance(lessonId, student) {
  const attendanceRef = doc(
    db,
    `lessons/${lessonId}/attendances/${student.uid}`
  );
  await setDoc(attendanceRef, {
    studentName: student.displayName || "Bilinmeyen",
    joinedAt: Timestamp.now(),
  });
}

function LiveLesson() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const jitsiContainerRef = useRef(null);
  const navigate = useNavigate(); // useNavigate burada kullanılıyor

  useEffect(() => {
    const fetchLesson = async () => {
      const docRef = doc(db, "lessons", lessonId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLesson(docSnap.data());
      }
    };
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/"); // Oturum kapalıysa anasayfaya yönlendir
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (lesson && currentUser && jitsiContainerRef.current) {
      const domain = "meet.jit.si";
      const options = {
        roomName: lesson.roomName || lessonId,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: currentUser.displayName || "Öğrenci",
        },
        width: "100%",
        height: 600,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      recordAttendance(lessonId, currentUser);

      return () => api.dispose();
    }
  }, [lesson]);

  if (!lesson) return <div className="p-4 text-center">Yükleniyor...</div>;

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
