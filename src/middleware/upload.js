const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Directorio donde se guardarán las imágenes
const uploadDir = path.join(__dirname, "..", "uploads", "profiles");

// Crear la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
