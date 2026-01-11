import fs from 'fs'
import path from 'path'

export const deleteFileIfExists = (relativePath) => {
    if (!relativePath) return

    const filePath = path.join(process.cwd(), relativePath)

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return // ไม่มีไฟล์ → ไม่ต้องทำอะไร

        fs.unlink(filePath, (err) => {
            if (err) console.error('❌ Failed to delete file:', err)
        })
    })
}
