// src/pages/Teacher/ViewVideosPage.jsx
import { useEffect, useState } from "react";

function ViewVideosPage({ role }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/list-videos")
      .then((res) => (res.ok ? res.json() : { videos: [] }))
      .then((data) => {
        setVideos(data.videos || []);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (filename) => {
    if (!window.confirm(`${filename} adlı videoyu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/delete-video/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVideos((prev) => prev.filter((f) => f !== filename));
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch {
      alert("Bir hata oluştu.");
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Videolar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((filename) => (
          <div key={filename} className="bg-white rounded-xl shadow p-5 flex flex-col">
            <video
              src={`http://localhost:5000/videos/${filename}`}
              controls
              className="w-full rounded mb-4"
              style={{ maxHeight: "300px" }}
            />
            <p>{filename}</p>
            <p className="text-sm text-gray-600 mt-1">
              Yükleyen: {videos.find((video) => video.filename === filename)?.uploaderName || "Bilinmiyor"}
            </p>
            {role === "teacher" && (
              <button
                onClick={() => handleDelete(filename)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sil
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewVideosPage;