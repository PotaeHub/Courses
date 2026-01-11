<script setup>
import { ref, onMounted } from 'vue'
import { X, Upload, Plus, Trash2, FileText, Video, Image as ImageIcon, AlertCircle } from 'lucide-vue-next'
import api from '../../service/api'

const emit = defineEmits(['close', 'created'])

/* ================= STATE ================= */
const loading = ref(false)
const isDragging = ref(false)
const categories = ref([])
const imagePreview = ref(null)
const imageFile = ref(null)
const imageError = ref('') // Error สำหรับรูปหน้าปก

const form = ref({
    title: '',
    description: '',
    price: '',
    status: 'DRAFT',
    categoryId: '',
})

const lessons = ref([])

const statusOptions = [
    { label: 'Draft Mode', value: 'DRAFT' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Archived', value: 'ARCHIVED' },
]

/* ================= FETCH ================= */
const fetchCategories = async () => {
    try {
        const res = await api.get('/teacher/categories')
        categories.value = res.data.data
    } catch (err) {
        console.error("Fetch categories failed", err)
    }
}
onMounted(fetchCategories)

/* ================= VALIDATION HELPERS ================= */
const validateImage = (file) => {
    imageError.value = ''
    if (!file) return false
    if (!file.type.startsWith('image/')) {
        imageError.value = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)'
        return false
    }
    if (file.size > 5 * 1024 * 1024) {
        imageError.value = 'ขนาดรูปภาพต้องไม่เกิน 5MB'
        return false
    }
    return true
}

const validateVideo = (file, index) => {
    lessons.value[index].error = ''
    if (!file) return false
    if (!file.type.startsWith('video/')) {
        lessons.value[index].error = 'กรุณาเลือกไฟล์วิดีโอเท่านั้น (MP4, MOV)'
        return false
    }
    if (file.size > 100 * 1024 * 1024) {
        lessons.value[index].error = 'ขนาดวิดีโอต้องไม่เกิน 100MB'
        return false
    }
    return true
}

/* ================= HANDLERS ================= */
// Image Handlers
const handleImageFile = (file) => {
    if (validateImage(file)) {
        imageFile.value = file
        imagePreview.value = URL.createObjectURL(file)
    }
}
const onImageChange = (e) => handleImageFile(e.target.files[0])
const onDrop = (e) => {
    isDragging.value = false
    handleImageFile(e.dataTransfer.files[0])
}

// Lesson Video Handlers
const onLessonVideoChange = (e, index) => {
    const file = e.target.files[0]
    if (validateVideo(file, index)) {
        lessons.value[index].videoFile = file
        lessons.value[index].videoFileName = file.name
        lessons.value[index].videoPreview = URL.createObjectURL(file)
    }
}
const onLessonVideoDrop = (e, index) => {
    e.preventDefault()
    lessons.value[index].isDragging = false
    const file = e.dataTransfer.files[0]
    if (validateVideo(file, index)) {
        lessons.value[index].videoFile = file
        lessons.value[index].videoFileName = file.name
        lessons.value[index].videoPreview = URL.createObjectURL(file)
    }
}

const addLesson = () => {
    lessons.value.push({
        title: '',
        content: '',
        videoFile: null,
        videoFileName: '',
        isDragging: false,
        videoPreview: null,
        error: '' // สำหรับเก็บ error message แยกแต่ละบทเรียน
    })
}

const removeLesson = (index) => lessons.value.splice(index, 1)

const getFileUrl = (path) => {
    if (!path) return null
    const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

/* ================= SUBMIT ================= */
const submit = async () => {
    // Basic Validation before submit
    if (!form.value.title) { alert('กรุณาระบุชื่อคอร์ส'); return }
    if (!imageFile.value) { imageError.value = 'กรุณาอัปโหลดรูปหน้าปกคอร์ส'; return }

    try {
        loading.value = true
        const formData = new FormData()
        formData.append('title', form.value.title)
        formData.append('description', form.value.description)
        formData.append('price', form.value.price)
        formData.append('status', form.value.status)
        formData.append('categoryId', form.value.categoryId)

        if (imageFile.value) formData.append('image', imageFile.value)

        const cleanLessons = lessons.value.map(l => ({
            title: l.title,
            content: l.content
        }))
        formData.append('lessons', JSON.stringify(cleanLessons))

        lessons.value.forEach((lesson, index) => {
            if (lesson.videoFile) {
                formData.append(`video_lesson_${index}`, lesson.videoFile)
            }
        })

        await api.post('/teacher/course', formData)
        emit('created')
        emit('close')
    } catch (err) {
        console.error(err)
        alert('Create failed')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-slate-900">
        <div
            class="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in duration-300">

            <div class="p-8 flex items-center justify-between border-b border-slate-50">
                <div>
                    <h2 class="text-3xl font-black tracking-tight">Create New Course</h2>
                    <p class="text-slate-500 font-medium text-sm">ออกแบบคอร์สเรียนและอัปโหลดเนื้อหาของคุณ</p>
                </div>
                <button @click="emit('close')"
                    class="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X :size="24" />
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 pt-4 space-y-8 custom-scrollbar bg-slate-50/20">

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div class="lg:col-span-7 space-y-6">
                        <div class="space-y-4">
                            <label
                                class="block text-xs font-black uppercase tracking-widest text-slate-400 ml-2">General
                                Info</label>
                            <input v-model="form.title" placeholder="ชื่อคอร์สของคุณ" class="input-modern" />
                            <textarea v-model="form.description" placeholder="อธิบายรายละเอียดคอร์สสั้นๆ..."
                                class="input-modern h-32 resize-none" />

                            <div class="grid grid-cols-2 gap-4">
                                <div class="relative">
                                    <span
                                        class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">฿</span>
                                    <input v-model="form.price" type="number" placeholder="ราคา"
                                        class="input-modern pl-10" />
                                </div>
                                <select v-model="form.categoryId" class="input-modern">
                                    <option value="">เลือกหมวดหมู่</option>
                                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                                </select>
                            </div>
                        </div>

                        <hr class="border-slate-100" />

                        <div class="space-y-6">
                            <div class="flex justify-between items-center px-2">
                                <div class="flex items-center gap-2">
                                    <FileText class="text-blue-500" :size="20" />
                                    <h3 class="text-lg font-black">Course Lessons</h3>
                                </div>
                                <button @click="addLesson"
                                    class="flex items-center gap-2 text-blue-600 font-black bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                                    <Plus :size="18" stroke-width="3" /> Add Lesson
                                </button>
                            </div>

                            <div class="grid grid-cols-1 gap-4">
                                <div v-for="(lesson, i) in lessons" :key="i"
                                    class="group relative bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all animate-in slide-in-from-top-2">

                                    <div class="flex justify-between mb-4">
                                        <span
                                            class="bg-slate-50 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 border border-slate-100">LESSON
                                            #{{ i + 1 }}</span>
                                        <button @click="removeLesson(i)"
                                            class="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 :size="18" />
                                        </button>
                                    </div>

                                    <div class="space-y-4">
                                        <input v-model="lesson.title" placeholder="ชื่อบทเรียน" class="input-sub" />

                                        <div class="relative group/vid">
                                            <div class="relative border-2 border-dashed rounded-2xl p-4 transition-all overflow-hidden"
                                                :class="[
                                                    lesson.isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/50 hover:bg-white',
                                                    lesson.error ? 'border-red-400 bg-red-50/50' : ''
                                                ]" @dragover.prevent="lesson.isDragging = true"
                                                @dragleave.prevent="lesson.isDragging = false"
                                                @drop.prevent="onLessonVideoDrop($event, i)">

                                                <div v-if="!lesson.videoPreview"
                                                    class="flex items-center gap-3 text-slate-400 py-2">
                                                    <Video :size="20" :class="lesson.error ? 'text-red-400' : ''" />
                                                    <span class="text-xs font-bold"
                                                        :class="lesson.error ? 'text-red-400' : ''">
                                                        {{ lesson.error || 'Drag & Drop Video or Click to Browse' }}
                                                    </span>
                                                </div>

                                                <video v-else :src="lesson.videoPreview" controls
                                                    class="w-full rounded-xl shadow-inner" />

                                                <input type="file" accept="video/*"
                                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                                    @change="onLessonVideoChange($event, i)" />

                                                <button v-if="lesson.videoPreview"
                                                    @click.stop="lesson.videoFile = null; lesson.videoPreview = null"
                                                    class="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-500">
                                                    <X :size="12" />
                                                </button>
                                            </div>
                                            <p v-if="lesson.error"
                                                class="text-[10px] text-red-500 font-black mt-1.5 flex items-center gap-1 ml-1 animate-in fade-in">
                                                <AlertCircle :size="10" /> {{ lesson.error }}
                                            </p>
                                        </div>

                                        <textarea v-model="lesson.content" placeholder="เนื้อหาบทเรียนย่อๆ..."
                                            class="input-sub h-24 resize-none" />
                                    </div>
                                </div>
                            </div>

                            <div v-if="lessons.length === 0"
                                class="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                <div
                                    class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <FileText :size="32" />
                                </div>
                                <p class="text-slate-400 font-black uppercase tracking-widest text-xs">No lessons added
                                    yet</p>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-5 space-y-6">
                        <div class="sticky top-4 space-y-6">
                            <div class="space-y-4">
                                <label
                                    class="block text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Course
                                    Cover Image</label>

                                <div @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                                    @drop.prevent="onDrop"
                                    class="relative aspect-[4/3] border-3 border-dashed rounded-[2.5rem] transition-all flex flex-col items-center justify-center overflow-hidden group shadow-inner"
                                    :class="[
                                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50',
                                        imageError ? 'border-red-300 bg-red-50' : ''
                                    ]">

                                    <div v-if="!imagePreview" class="text-center p-8 pointer-events-none">
                                        <div
                                            class="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 text-blue-500 transition-transform group-hover:scale-110">
                                            <ImageIcon :size="32" stroke-width="1.5" />
                                        </div>
                                        <p class="font-black text-slate-700 tracking-tight">Drop Image Here</p>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                            Recommended: 1600 x 1200 px</p>
                                    </div>

                                    <img v-else :src="imagePreview" class="w-full h-full object-cover" />
                                    <input type="file" accept="image/*"
                                        class="absolute inset-0 opacity-0 cursor-pointer" @change="onImageChange" />

                                    <button v-if="imagePreview" @click.stop="imagePreview = null; imageFile = null"
                                        class="absolute top-6 right-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 :size="20" />
                                    </button>
                                </div>
                                <p v-if="imageError"
                                    class="text-xs text-red-500 font-black ml-4 flex items-center gap-1.5 animate-in slide-in-from-left-2">
                                    <AlertCircle :size="14" /> {{ imageError }}
                                </p>
                            </div>

                            <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div class="space-y-3">
                                    <label
                                        class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Status</label>
                                    <div class="grid grid-cols-1 gap-2">
                                        <button v-for="opt in statusOptions" :key="opt.value"
                                            @click="form.status = opt.value"
                                            class="flex items-center justify-between px-5 py-3 rounded-2xl font-black text-sm transition-all border-2"
                                            :class="form.status === opt.value ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'">
                                            {{ opt.label }}
                                            <div v-if="form.status === opt.value" class="w-2 h-2 bg-white rounded-full">
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div class="pt-4 space-y-3">
                                    <button @click="submit" :disabled="loading" class="btn-primary w-full">
                                        <span v-if="loading"
                                            class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></span>
                                        {{ loading ? 'Creating...' : 'Create Course' }}
                                    </button>
                                    <button @click="emit('close')"
                                        class="w-full py-4 text-slate-400 font-black text-sm hover:text-slate-600 transition-colors">
                                        Discard Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";

.input-modern {
    @apply w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 font-bold text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 placeholder:text-slate-300;
}

.input-sub {
    @apply w-full px-5 py-3 rounded-xl bg-slate-50 border border-transparent font-bold text-sm text-slate-600 outline-none transition-all focus:bg-white focus:border-blue-200 placeholder:text-slate-400/60;
}

.btn-primary {
    @apply py-4 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center disabled:opacity-50 disabled:transform-none;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 rounded-full;
}
</style>