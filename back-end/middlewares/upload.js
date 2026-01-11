import multer from "multer"
import fs from "fs"
import path from "path"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads/misc'

        if (file.fieldname === 'image') {
            dir = 'uploads/courses/images'
        }

        if (file.fieldname.startsWith('video_lesson_')) {
            dir = 'uploads/lessons/videos'
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        cb(null, dir)
    },

    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, `${unique}${ext}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('video/')
    ) {
        cb(null, true)
    } else {
        cb(new Error('Only image or video allowed'), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 500 // 500MB
    }
})
