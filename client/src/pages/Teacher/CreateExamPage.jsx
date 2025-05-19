import { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function CreateExamPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("klasik");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const navigate = useNavigate();

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "questionText") {
      updated[index].questionText = value;
    } else if (field.startsWith("option")) {
      const optionIndex = parseInt(field.slice(-1));
      updated[index].options[optionIndex] = value;
    } else if (field === "correctAnswer") {
      updated[index].correctAnswer = value;
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const examData = {
      teacherId: currentUser.uid,
      title,
      type,
      questions:
        type === "klasik"
          ? questions.map((q) => ({ questionText: q.questionText }))
          : questions,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "exams"), examData);
      alert("Sınav başarıyla oluşturuldu!");
      navigate("/teacher-dashboard");
    } catch (err) {
      console.error("Sınav kaydedilemedi:", err);
      alert("Bir hata oluştu.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">📝 Sınav Oluştur</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Sınav Başlığı</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Sınav Türü</label>
          <select
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setQuestions([
                {
                  questionText: "",
                  options: ["", "", "", ""],
                  correctAnswer: "",
                },
              ]);
            }}
          >
            <option value="klasik">Klasik</option>
            <option value="test">Test</option>
          </select>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Sorular</h3>
          {questions.map((q, index) => (
            <div key={index} className="mb-4 border p-4 rounded bg-gray-50">
              <label className="block mb-1">Soru {index + 1}</label>
              <input
                type="text"
                className="w-full border p-2 rounded mb-2"
                placeholder="Soru metni"
                value={q.questionText}
                onChange={(e) =>
                  handleQuestionChange(index, "questionText", e.target.value)
                }
              />

              {type === "test" && (
                <>
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      className="w-full border p-2 rounded mb-1"
                      placeholder={`Seçenek ${i + 1}`}
                      value={q.options[i]}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          `option${i}`,
                          e.target.value
                        )
                      }
                    />
                  ))}
                  <input
                    type="text"
                    className="w-full border p-2 rounded mt-2"
                    placeholder="Doğru cevap (A, B, C, D)"
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "correctAnswer",
                        e.target.value
                      )
                    }
                    required
                  />
                </>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Soru Ekle
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Sınavı Kaydet
        </button>
      </form>
    </div>
  );
}

export default CreateExamPage;
