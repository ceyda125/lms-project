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
    if (
      !window.confirm(
        `${filename} adlı videoyu silmek istediğinize emin misiniz?`
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/delete-video/${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        // Nesneyi filename’e bakarak çıkar
        setVideos((prev) => prev.filter((v) => v.filename !== filename));
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
        {videos.map((video) => (
          <div
            key={video.filename}
            className="bg-white rounded-xl shadow p-5 flex flex-col"
          >
            <video
              src={`http://localhost:5000/videos/${video.filename}`}
              controls
              className="w-full rounded mb-4"
              style={{ maxHeight: "300px" }}
            />

            {/* Başlık varsa onu, yoksa dosya adını göster */}
            <p className="font-medium">{video.title || video.filename}</p>

            <p className="text-sm text-gray-600 mt-1">
              Yükleyen: {video.uploaderName}
            </p>

            {role === "teacher" && (
              <button
                onClick={() => handleDelete(video.filename)}
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
