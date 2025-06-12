// src/pages/Teacher/UploadVideoPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UploadVideoPage({ user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert("Lütfen video seçin.");

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("uploaderName", user?.name || user?.displayName || "Bilinmiyor");

    setUploading(true);

    try {
      const response = await fetch("http://localhost:5000/upload-video", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Video başarıyla yüklendi!");
        navigate("/dashboard");
      } else {
        alert("Yükleme sırasında hata oluştu!");
      }
    } catch (err) {
      alert("Sunucuya ulaşılamadı!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl w-full p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          🎥 Video Yükle
        </h2>
        <form onSubmit={handleVideoUpload} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Video Başlığı
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
              Açıklama
            </label>
            <textarea
              className="w-full p-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Video Dosyası
            </label>
            <input
              type="file"
              accept="video/*"
              className="w-full"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-8 py-3 w-full transition"
          >
            {uploading ? "Yükleniyor..." : "Videoyu Yükle"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideoPage;
