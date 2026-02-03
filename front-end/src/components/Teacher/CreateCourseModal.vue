<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
    X, Plus, Trash2, FileText, Video, Image as ImageIcon, AlertCircle
} from 'lucide-vue-next'
import api from '../../service/api'

const emit = defineEmits(['close', 'created'])

/* ================= STATE ================= */
const loading = ref(false)
const isDragging = ref(false)
const categories = ref([])
const imagePreview = ref(null)
const imageFile = ref(null)
const imageError = ref('')

const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Published', value: 'PUBLISHED' }
]

const form = ref({
    title: '',
    description: '',
    price: '',
    status: 'DRAFT',
    categoryId: '',
    preTestUrl: '',
    postTestUrl: ''
})

const lessons = ref([])

/* ================= HELPERS ================= */
// ป้องกัน memory leak
const objectUrls = new Set()
const createSafeUrl = (file) => {
    const url = URL.createObjectURL(file)
    objectUrls.add(url)
    return url
}
onUnmounted(() => {
    objectUrls.forEach(url => URL.revokeObjectURL(url))
})

/* ================= FETCH ================= */
const fetchCategories = async () => {
    try {
        const res = await api.get('/teacher/categories')
        categories.value = res.data.data
    } catch {
        console.error('Fetch categories failed')
    }
}
onMounted(fetchCategories)

/* ================= VALIDATE ================= */
const googleFormRegex =
    /^https:\/\/docs\.google\.com\/forms\/d\/e\/.+\/viewform/

const isGoogleFormUrl = (url) => {
    if (!url) return true
    return googleFormRegex.test(url)
}

const validateImage = (file) => {
    imageError.value = ''
    if (!file) return false
    if (!file.type.startsWith('image/')) {
        imageError.value = 'กรุณาเลือกไฟล์รูปภาพ'
        return false
    }
    if (file.size > 5 * 1024 * 1024) {
        imageError.value = 'รูปต้องไม่เกิน 5MB'
        return false
    }
    return true
}

/* ================= IMAGE ================= */
const handleImageFile = (file) => {
    if (validateImage(file)) {
        imageFile.value = file
        imagePreview.value = createSafeUrl(file)
    }
}
const onImageChange = (e) => handleImageFile(e.target.files[0])
const onDrop = (e) => {
    isDragging.value = false
    handleImageFile(e.dataTransfer.files[0])
}

/* ================= LESSON ================= */
const addLesson = () => {
    lessons.value.push({
        title: '',
        content: '',
        videoFile: null,
        videoPreview: null,
        isDragging: false,
        error: ''
    })
}

const handleLessonVideo = (file, index) => {
    const lesson = lessons.value[index]
    lesson.error = ''

    if (!file) return
    if (!file.type.startsWith('video/')) {
        lesson.error = 'ต้องเป็นไฟล์วิดีโอเท่านั้น'
        return
    }
    if (file.size > 100 * 1024 * 1024) {
        lesson.error = 'วิดีโอต้องไม่เกิน 100MB'
        return
    }

    lesson.videoFile = file
    lesson.videoPreview = createSafeUrl(file)
}

const onLessonVideoChange = (e, index) =>
    handleLessonVideo(e.target.files[0], index)

const onLessonVideoDrop = (e, index) => {
    lessons.value[index].isDragging = false
    handleLessonVideo(e.dataTransfer.files[0], index)
}

const removeLesson = (i) => lessons.value.splice(i, 1)

/* ================= SUBMIT ================= */
const submit = async () => {
    if (!form.value.title) return alert('กรุณากรอกชื่อคอร์ส')
    if (!imageFile.value) {
        imageError.value = 'กรุณาอัปโหลดรูปหน้าปก'
        return
    }
    if (!form.value.categoryId) return alert('กรุณาเลือกหมวดหมู่')

    if (
        !isGoogleFormUrl(form.value.preTestUrl) ||
        !isGoogleFormUrl(form.value.postTestUrl)
    ) {
        return alert('แบบทดสอบต้องเป็น Google Form เท่านั้น')
    }

    loading.value = true
    try {
        const fd = new FormData()
        Object.entries(form.value).forEach(([k, v]) =>
            fd.append(k, v)
        )
        fd.append('image', imageFile.value)

        fd.append(
            'lessons',
            JSON.stringify(
                lessons.value.map(l => ({
                    title: l.title,
                    content: l.content
                }))
            )
        )

        // backend ต้อง map ตาม index
        lessons.value.forEach((l, i) => {
            if (l.videoFile) fd.append(`video_lesson_${i}`, l.videoFile)
        })

        await api.post('/teacher/course', fd)
        emit('created')
        emit('close')
    } catch (e) {
        alert(e.response?.data?.message || 'Create failed')
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
                            <div class="grid grid-cols-2 gap-4">
                                <input v-model="form.preTestUrl" placeholder="Pre-test (Google Form)"
                                    class="input-modern" />
                                <input v-model="form.postTestUrl" placeholder="Post-test (Google Form)"
                                    class="input-modern" />
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
                                                class="text-[10px] text-red-500 font-black mt-1.5 flex items-center gap-1 ml-1">
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
                                    class="text-xs text-red-500 font-black ml-4 flex items-center gap-1.5">
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
@import 'tailwindcss';

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

/* Base Input Styles */
.input-modern {
    @apply w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-medium transition-all duration-300 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm;
}

.input-sub {
    @apply w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-sm font-medium transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5;
}

.btn-primary {
    @apply flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Animation */
.animate-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>