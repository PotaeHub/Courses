<script setup>
import { ref, onUnmounted } from 'vue'
import api from '../../service/api'
import {
    X, Plus, Trash2, Upload, PlayCircle,
    ImageIcon, FileText, Video, AlertCircle, Save,
    Globe, Lock, Archive // เพิ่มไอคอนสำหรับ Status
} from 'lucide-vue-next'

/* ================= ENV ================= */
const BACKEND = import.meta.env.VITE_BACKEND_URL

/* ================= PROPS & EMITS ================= */
const props = defineProps({
    course: { type: Object, required: true },
    categories: { type: Array, required: true }
})
console.log(props.course)
const emit = defineEmits(['close', 'updated'])

/* ================= STATE & INITIAL DATA ================= */
const loading = ref(false)

const getFullPath = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const cleanPath = path.startsWith('/') ? path.substring(1) : path
    return `${BACKEND}/${cleanPath}`
}

/* ---------- IMAGE STATE ---------- */
const imageFile = ref(null)
const imagePreview = ref(getFullPath(props.course?.image))

/* ---------- FORM STATE ---------- */
const form = ref({
    id: props.course.id,
    title: props.course.title || '',
    description: props.course.description || '',
    price: props.course.price || 0,
    status: props.course.status || 'DRAFT',
    categoryId: props.course.categoryId || '',
    preTestUrl: props.course.preTestUrl || '',
    postTestUrl: props.course.postTestUrl || ''
})

/* ---------- LESSONS STATE ---------- */
const lessons = ref(
    (props.course.lessons || []).map(l => ({
        id: l.id,
        title: l.title || '',
        content: l.content || '',
        videoFile: null,
        videoPreview: l.videos?.[0]?.url ? getFullPath(l.videos[0].url) : null,
        replaceVideo: false,
        error: ''
    }))
)

/* ================= HELPERS & HANDLERS ================= */
const objectUrls = new Set()
const createSafeUrl = (file) => {
    const url = URL.createObjectURL(file)
    objectUrls.add(url)
    return url
}
onUnmounted(() => objectUrls.forEach(url => URL.revokeObjectURL(url)))

const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    imageFile.value = file
    imagePreview.value = createSafeUrl(file)
}

const addLesson = () => {
    lessons.value.push({
        id: null,
        title: '',
        content: '',
        videoFile: null,
        videoPreview: null,
        replaceVideo: false,
        error: ''
    })
}

const removeLesson = (index) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบบทเรียนนี้?')) {
        lessons.value.splice(index, 1)
    }
}

const handleVideoFile = (file, index) => {
    if (!file) return
    const lesson = lessons.value[index]
    if (!file.type.startsWith('video/')) {
        lesson.error = 'ต้องเป็นไฟล์วิดีโอเท่านั้น'
        return
    }
    lesson.videoFile = file
    lesson.videoPreview = createSafeUrl(file)
    lesson.replaceVideo = true
    lesson.error = ''
}

/* ================= SUBMIT ================= */
const submit = async () => {
    if (!form.value.title) return alert('กรุณากรอกชื่อคอร์ส')

    loading.value = true
    try {
        const fd = new FormData()

        // Append ข้อมูลคอร์ส (รวม status ด้วย)
        Object.entries(form.value).forEach(([k, v]) => fd.append(k, v))

        if (imageFile.value) fd.append('image', imageFile.value)

        fd.append('lessons', JSON.stringify(
            lessons.value.map(l => ({
                id: l.id,
                title: l.title,
                content: l.content
            }))
        ))

        lessons.value.forEach((l, i) => {
            if (l.videoFile) fd.append(`video_lesson_${i}`, l.videoFile)
            if (l.replaceVideo) fd.append(`replace_video_lesson_${i}`, '1')
        })

        await api.put(`/teacher/course/${form.value.id}`, fd)
        emit('updated')
        emit('close')
    } catch (err) {
        alert(err.response?.data?.message || 'Update failed')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

            <div class="p-8 flex items-center justify-between border-b border-slate-50">
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Save :size="24" />
                    </div>
                    <div>
                        <h2 class="text-3xl font-black tracking-tight uppercase">Edit Course</h2>
                        <p class="text-slate-500 font-medium text-sm">Modify and update your course visibility</p>
                    </div>
                </div>
                <button @click="emit('close')"
                    class="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X :size="24" />
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/20">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <div class="lg:col-span-7 space-y-8">
                        <section class="space-y-4">
                            <label class="section-label">General Information</label>
                            <input v-model="form.title" class="input-modern" placeholder="Course Title" />
                            <textarea v-model="form.description" class="input-modern h-32 resize-none"
                                placeholder="Description" />

                            <div class="grid grid-cols-2 gap-4">
                                <div class="relative">
                                    <span
                                        class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">฿</span>
                                    <input v-model="form.price" type="number" class="input-modern pl-10" />
                                </div>
                                <select v-model="form.categoryId" class="input-modern">
                                    <option value="">Select Category</option>
                                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                                </select>
                            </div>
                        </section>

                        <section class="space-y-6">
                            <div class="flex justify-between items-center">
                                <h3 class="text-xl font-black flex items-center gap-2">
                                    <FileText class="text-blue-500" /> Lessons
                                </h3>
                                <button @click="addLesson" class="btn-add">
                                    <Plus :size="18" /> Add Lesson
                                </button>
                            </div>
                            <div class="space-y-4">
                                <div v-for="(lesson, i) in lessons" :key="i" class="lesson-card">
                                    <div class="flex justify-between mb-4">
                                        <span class="lesson-badge">LESSON {{ i + 1 }}</span>
                                        <button @click="removeLesson(i)" class="text-slate-300 hover:text-red-500">
                                            <Trash2 :size="18" />
                                        </button>
                                    </div>
                                    <div class="space-y-4">
                                        <input v-model="lesson.title" class="input-sub" placeholder="Lesson title" />
                                        <div
                                            class="relative aspect-video rounded-2xl overflow-hidden bg-black group/vid border-2 border-slate-100">
                                            <video v-if="lesson.videoPreview" :src="lesson.videoPreview" controls
                                                class="w-full h-full" />
                                            <div v-else
                                                class="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                                                <Video :size="40" stroke-width="1" />
                                                <p class="text-xs font-bold mt-2">No Video</p>
                                            </div>
                                            <label
                                                class="absolute inset-0 bg-black/40 opacity-0 group-hover/vid:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                <div
                                                    class="bg-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-xl">
                                                    <Upload :size="16" /> {{ lesson.videoPreview ? 'Change Video' :
                                                        'Upload Video' }}
                                                </div>
                                                <input type="file" accept="video/*" class="hidden"
                                                    @change="e => handleVideoFile(e.target.files[0], i)" />
                                            </label>
                                        </div>
                                        <textarea v-model="lesson.content" class="input-sub h-24"
                                            placeholder="Brief content..." />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div class="lg:col-span-5">
                        <div class="sticky top-0 space-y-6">

                            <section class="space-y-3">
                                <label class="section-label">Course Status</label>
                                <div class="grid grid-cols-1 gap-2">
                                    <button @click="form.status = 'DRAFT'"
                                        :class="form.status === 'DRAFT' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-400 opacity-60'"
                                        class="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group">
                                        <div :class="form.status === 'DRAFT' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'"
                                            class="w-10 h-10 rounded-xl flex items-center justify-center">
                                            <Lock :size="20" />
                                        </div>
                                        <div>
                                            <p class="font-black text-sm">DRAFT</p>
                                            <p class="text-[10px] font-medium opacity-70">Private to you only</p>
                                        </div>
                                    </button>

                                    <button @click="form.status = 'PUBLISHED'"
                                        :class="form.status === 'PUBLISHED' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 opacity-60'"
                                        class="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left">
                                        <div :class="form.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'"
                                            class="w-10 h-10 rounded-xl flex items-center justify-center">
                                            <Globe :size="20" />
                                        </div>
                                        <div>
                                            <p class="font-black text-sm">PUBLISHED</p>
                                            <p class="text-[10px] font-medium opacity-70">Visible to all students</p>
                                        </div>
                                    </button>

                                    <button @click="form.status = 'ARCHIVED'"
                                        :class="form.status === 'ARCHIVED' ? 'border-slate-600 bg-slate-100 text-slate-700' : 'border-slate-100 text-slate-400 opacity-60'"
                                        class="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left">
                                        <div :class="form.status === 'ARCHIVED' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'"
                                            class="w-10 h-10 rounded-xl flex items-center justify-center">
                                            <Archive :size="20" />
                                        </div>
                                        <div>
                                            <p class="font-black text-sm">ARCHIVED</p>
                                            <p class="text-[10px] font-medium opacity-70">Hidden from storefront</p>
                                        </div>
                                    </button>
                                </div>
                            </section>

                            <section class="space-y-4">
                                <label class="section-label">Course Cover</label>
                                <div
                                    class="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-100 border-3 border-dashed border-slate-200 group">
                                    <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                                        <ImageIcon :size="48" stroke-width="1" />
                                        <p class="text-sm font-bold mt-2">Click to upload cover</p>
                                    </div>
                                    <input type="file" accept="image/*"
                                        class="absolute inset-0 opacity-0 cursor-pointer"
                                        @change="e => handleImageFile(e.target.files[0])" />
                                </div>
                            </section>

                            <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                                <button @click="submit" :disabled="loading"
                                    class="btn-primary w-full flex items-center justify-center gap-2">
                                    <span v-if="loading"
                                        class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    {{ loading ? 'Saving...' : 'Save Changes' }}
                                </button>
                                <button @click="emit('close')"
                                    class="w-full py-2 text-slate-400 font-bold hover:text-red-500 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* (Styles เดิมของคุณ) */
@import "tailwindcss";

.input-modern {
    @apply w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm;
}

.input-sub {
    @apply w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-400 transition-all;
}

.btn-primary {
    @apply py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all disabled:opacity-50;
}

.btn-add {
    @apply flex items-center gap-2 text-blue-600 font-black bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all;
}

.lesson-card {
    @apply bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all;
}

.lesson-badge {
    @apply bg-slate-50 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400;
}

.section-label {
    @apply block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>