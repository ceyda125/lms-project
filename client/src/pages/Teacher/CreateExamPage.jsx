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
      navigate("/dashboard");
    } catch (err) {
      console.error("Sınav kaydedilemedi:", err);
      alert("Bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-5xl w-full p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          📝 Sınav Oluştur
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Sınav Başlığı
            </label>
            <input
              type="text"
              className="w-full p-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Sınav Türü
            </label>
            <select
              className="w-full p-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Sorular
            </h3>
            {questions.map((q, index) => (
              <div
                key={index}
                className="mb-6 p-6 bg-gray-50 rounded-md border border-gray-200"
              >
                <label className="block mb-2 font-medium text-gray-700">
                  Soru {index + 1}
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-md border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full p-3 rounded-md border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full p-3 rounded-md border border-gray-300 mt-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md px-6 py-2 transition"
            >
              Soru Ekle
            </button>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md px-8 py-3 w-full transition"
          >
            Sınavı Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateExamPage;
