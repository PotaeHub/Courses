import multer from 'multer';
import path from "path";
import fs from "fs";
const storage = multer.diskStorage({
    // destination โฟลเดอร์เก็บไฟล์
    destination: (req, file, cb) => {
        const type = file.mimetype.startsWith("image/") ? "images/" : "videos/";
        const dir = `uploads/${type}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);

    },
    // filename ตั้งชื่อไฟล์ใหม่
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
}
)
// กรองชนิดไฟล์ (สำคัญมาก)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image and video files are allowed"), false);
    }
}
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 500 // 500MB
    }
})