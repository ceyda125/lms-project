// backend/server.js

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const videosMetaPath = path.join(__dirname, "videos.json");

// "videos" klasörü yoksa oluştur
const videoDir = path.join(__dirname, "videos");
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}

const app = express();
app.use(cors()); // Tüm origin'lerden istek al

// Multer ile yükleme ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "videos");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// Meta okuma/yazma fonksiyonları
function readVideosMeta() {
  if (!fs.existsSync(videosMetaPath)) return {};
  return JSON.parse(fs.readFileSync(videosMetaPath, "utf8"));
}
function writeVideosMeta(meta) {
  fs.writeFileSync(videosMetaPath, JSON.stringify(meta, null, 2), "utf8");
}

// Video yükleme endpoint'i
app.post("/upload-video", upload.single("video"), (req, res) => {
  const { title, description, uploaderName } = req.body;
  const filename = req.file.filename;
  // Meta veriyi güncelle
  const meta = readVideosMeta();
  meta[filename] = { title, description, uploaderName };
  writeVideosMeta(meta);

  res.status(200).json({
    message: "Video yüklendi",
    filename,
    url: `http://localhost:5000/videos/${filename}`,
    title,
    description,
    uploaderName,
  });
});

// Video listeleme endpoint'i
app.get("/list-videos", (req, res) => {
  const videoDir = path.join(__dirname, "videos");
  fs.readdir(videoDir, (err, files) => {
    if (err) return res.status(500).json({ videos: [] });
    const filtered = files.filter((f) => /\.(mp4|webm|mov|avi)$/i.test(f));
    const meta = readVideosMeta();
    // Her video için meta veriyi ekle
    const videos = filtered.map((f) => ({
      filename: f,
      uploaderName: meta[f]?.uploaderName || "Bilinmiyor",
      ...meta[f],
    }));
    res.json({ videos });
  });
});
app.delete("/delete-video/:filename", (req, res) => {
  const decodedFilename = decodeURIComponent(req.params.filename);
  console.log("Silinecek dosya:", decodedFilename); // EKLENDİ
  const videoPath = path.join(__dirname, "videos", decodedFilename);
  fs.unlink(videoPath, (err) => {
    if (err) {
      console.error("Silme hatası:", err);
      return res
        .status(500)
        .json({ success: false, message: "Dosya silinemedi!" });
    }
    res.json({ success: true, message: "Dosya silindi!" });
  });
});
// Statik video dosyalarını sunmak için:
app.use("/videos", express.static(path.join(__dirname, "videos")));

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Backend çalışıyor: http://localhost:${PORT}`)
);
