<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '../../service/api.js'

/* ================= PROPS / EMIT ================= */
const props = defineProps({
    course: { type: Object, required: true }
})
const emit = defineEmits(['close', 'updated'])

/* ================= STATE ================= */
const form = ref({
    id: null,
    title: '',
    description: '',
    image: '',
    imageFile: null,
    price: 0,
    type: '',
    categoryId: null,
    lessons: []
})

const deletedLessonIds = ref([])
const loading = ref(false)
const categories = ref([])

/* ================= LOAD CATEGORY ================= */
onMounted(async () => {
    const res = await api.get('admin/category')
    categories.value = res.data
})

/* ================= WATCH COURSE ================= */
watch(() => props.course, (val) => {
    if (!val) return
    form.value = JSON.parse(JSON.stringify(val))
    form.value.imageFile = null
    deletedLessonIds.value = []

    form.value.lessons.forEach(l => {
        l.videoFile = null
        l._tempId = l.id ?? crypto.randomUUID()
    })
}, { immediate: true })

/* ================= LESSON HANDLERS ================= */
const addLesson = () => {
    form.value.lessons.push({
        _tempId: crypto.randomUUID(),
        title: '',
        content: '',
        videoUrl: null,
        videoFile: null,
        sortOrder: form.value.lessons.length + 1
    })
}

const removeLesson = (index) => {
    const lesson = form.value.lessons[index]
    if (lesson.id) deletedLessonIds.value.push(lesson.id)

    form.value.lessons.splice(index, 1)
    form.value.lessons.forEach((l, i) => l.sortOrder = i + 1)
}

/* ================= FILE HANDLERS ================= */
const handleImageChange = (e) => {
    form.value.imageFile = e.target.files[0] || null
}

const handleLessonVideoChange = (index, e) => {
    form.value.lessons[index].videoFile = e.target.files[0] || null
}

/* ================= DRAG & DROP ================= */
const handleImageDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
        alert('กรุณาลากไฟล์รูปภาพเท่านั้น')
        return
    }
    form.value.imageFile = file
}

const handleLessonVideoDrop = (index, e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
        alert('กรุณาลากไฟล์วิดีโอเท่านั้น')
        return
    }
    form.value.lessons[index].videoFile = file
}

/* ================= PREVIEW (NO MEMORY LEAK) ================= */
let imagePreviewUrl = null
const videoPreviewUrls = new Map()

const courseImageUrl = computed(() => {
    if (form.value.imageFile) {
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
        imagePreviewUrl = URL.createObjectURL(form.value.imageFile)
        return imagePreviewUrl
    }
    if (form.value.image) {
        return `${import.meta.env.VITE_BACKEND_URL}/${form.value.image.replace(/^\/+/, '')}`
    }
    return null
})

const getLessonVideoUrl = (lesson) => {
    if (lesson.videoFile) {
        if (videoPreviewUrls.has(lesson._tempId)) {
            URL.revokeObjectURL(videoPreviewUrls.get(lesson._tempId))
        }
        const url = URL.createObjectURL(lesson.videoFile)
        videoPreviewUrls.set(lesson._tempId, url)
        return url
    }
    if (lesson.videoUrl) {
        return `${import.meta.env.VITE_BACKEND_URL}/${lesson.videoUrl.replace(/^\/+/, '')}`
    }
    return null
}

onBeforeUnmount(() => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    videoPreviewUrls.forEach(url => URL.revokeObjectURL(url))
})

/* ================= SUBMIT ================= */
const submit = async () => {
    if (loading.value) return

    if (!form.value.title.trim()) return alert('กรุณากรอกชื่อคอร์ส')
    if (!form.value.categoryId) return alert('กรุณาเลือกหมวดหมู่คอร์ส')
    if (!form.value.price || form.value.price <= 0) return alert('ราคาต้องมากกว่า 0')

    try {
        loading.value = true
        const formData = new FormData()

        formData.append("title", form.value.title)
        formData.append("description", form.value.description || "")
        formData.append("price", form.value.price)
        formData.append("type", form.value.type)
        formData.append("categoryId", form.value.categoryId)

        if (form.value.imageFile) {
            formData.append("image", form.value.imageFile)
        }

        const lessonsJson = form.value.lessons.map(l => ({
            id: l.id,
            title: l.title,
            content: l.content,
            sortOrder: l.sortOrder,
            videoUrl: l.videoUrl || null,
            videoFileName: l.videoFile ? l.videoFile.name : null
        }))

        formData.append("lessons", JSON.stringify(lessonsJson))
        formData.append("deletedLessonIds", JSON.stringify(deletedLessonIds.value))

        form.value.lessons.forEach(l => {
            if (l.videoFile) {
                formData.append("lessonVideos", l.videoFile)
            }
        })

        await api.put(`/admin/courses/${form.value.id}`, formData)

        emit('updated')
        emit('close')
    } catch (err) {
        alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div
        class="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div
            class="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden border border-white/20">

            <div
                class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-slate-800 tracking-tight">Edit Course</h2>
                        <p class="text-sm text-slate-500 font-medium">Manage your course content and lessons</p>
                    </div>
                </div>
                <button @click="emit('close')"
                    class="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div class="lg:col-span-8 space-y-10">

                        <div class="space-y-6">
                            <h3
                                class="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                                <span class="w-2 h-2 bg-blue-600 rounded-full"></span> General Information
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="md:col-span-2">
                                    <label class="label">Course Title</label>
                                    <input v-model="form.title" class="input" placeholder="Enter course name..." />
                                </div>
                                <div>
                                    <label class="label">Price (THB)</label>
                                    <div class="relative">
                                        <input v-model.number="form.price" type="number" class="input pl-10" />
                                        <span
                                            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">฿</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="label">Course Type</label>
                                    <select v-model="form.type" class="input appearance-none">
                                        <option value="GENERAL">GENERAL</option>
                                        <option value="POPULAR">POPULAR</option>
                                        <option value="PACKAGE">PACKAGE</option>
                                    </select>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="label">Description</label>
                                    <textarea v-model="form.description" class="input min-h-[120px] py-4"
                                        placeholder="Briefly describe what students will learn..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3
                                    class="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                                    <span class="w-2 h-2 bg-blue-600 rounded-full"></span> Course Curriculum
                                </h3>
                                <button @click="addLesson" class="btn-add group">
                                    <span
                                        class="bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-md group-hover:scale-110 transition-transform">+</span>
                                    Add New Lesson
                                </button>
                            </div>

                            <div class="space-y-6">
                                <div v-for="(lesson, i) in form.lessons" :key="lesson._tempId"
                                    class="lesson-card group">
                                    <div class="flex justify-between items-start mb-6">
                                        <div class="flex items-center gap-3">
                                            <span
                                                class="w-8 h-8 bg-slate-800 text-white flex items-center justify-center rounded-lg font-black text-xs shadow-lg shadow-slate-200">
                                                {{ i + 1 }}
                                            </span>
                                            <h4 class="font-bold text-slate-800">Lesson Details</h4>
                                        </div>
                                        <button @click="removeLesson(i)"
                                            class="text-xs font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path
                                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                                </path>
                                            </svg>
                                            Remove
                                        </button>
                                    </div>

                                    <div class="space-y-4">
                                        <input v-model="lesson.title" class="input-sub"
                                            placeholder="e.g. Introduction to the course" />
                                        <textarea v-model="lesson.content" class="input-sub min-h-[80px]"
                                            placeholder="Lesson summary or instructions..." />

                                        <div class="space-y-2">
                                            <label
                                                class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Lesson
                                                Video</label>
                                            <div class="drop-zone group/video" @dragover.prevent
                                                @drop="e => handleLessonVideoDrop(i, e)">
                                                <input type="file" @change="e => handleLessonVideoChange(i, e)"
                                                    class="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <div class="flex items-center justify-center gap-3 py-2">
                                                    <svg class="w-5 h-5 text-slate-400 group-hover/video:text-blue-500 transition-colors"
                                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                        fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                    <span class="text-xs font-bold text-slate-500">Drag video or click
                                                        to upload</span>
                                                </div>

                                                <div v-if="lesson.videoFile || lesson.videoUrl"
                                                    class="mt-4 relative rounded-xl overflow-hidden bg-black aspect-video shadow-inner">
                                                    <video :src="getLessonVideoUrl(lesson)" controls
                                                        class="w-full h-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-4 lg:border-l lg:pl-10 border-slate-100">
                        <div class="sticky top-0 space-y-8">
                            <div class="space-y-4">
                                <h3 class="text-blue-600 font-bold uppercase tracking-widest text-xs">Course Thumbnail
                                </h3>
                                <div class="drop-zone aspect-[4/3] rounded-[1.5rem] flex items-center justify-center overflow-hidden border-blue-100 bg-slate-50/50 group/thumb"
                                    @dragover.prevent @drop="handleImageDrop">

                                    <img v-if="courseImageUrl" :src="courseImageUrl"
                                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105" />

                                    <div v-if="!courseImageUrl" class="text-center space-y-2 p-6">
                                        <div
                                            class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                        </div>
                                        <p
                                            class="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                                            Drop cover image here</p>
                                    </div>

                                    <input type="file" @change="handleImageChange"
                                        class="absolute inset-0 opacity-0 cursor-pointer z-10" />

                                    <div
                                        class="absolute bottom-4 inset-x-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white shadow-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity translate-y-2 group-hover/thumb:translate-y-0 duration-300">
                                        <p class="text-[10px] font-black text-center text-blue-600 uppercase">Click or
                                            Drag to change</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-blue-50 rounded-2xl p-6 border border-blue-100 space-y-3">
                                <h4 class="text-sm font-bold text-blue-800">Quick Tips</h4>
                                <ul class="text-[11px] text-blue-600/80 space-y-2 font-medium">
                                    <li class="flex items-start gap-2"><span>•</span> Use high-quality JPG/PNG for
                                        covers.</li>
                                    <li class="flex items-start gap-2"><span>•</span> Keep lesson videos under 500MB.
                                    </li>
                                    <li class="flex items-start gap-2"><span>•</span> Descriptions help in SEO ranking.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div
                class="px-8 py-6 border-t border-slate-100 bg-white/80 backdrop-blur-md flex justify-end items-center gap-6">
                <button @click="emit('close')"
                    class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                    Discard Changes
                </button>
                <button @click="submit" :disabled="loading"
                    class="btn-primary flex items-center gap-3 min-w-[180px] justify-center shadow-xl shadow-blue-200">
                    <span v-if="loading"
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {{ loading ? 'Saving Changes...' : 'Update Course' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@reference '../../style.css';

/* Custom Scrollbar for better look */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 rounded-full hover:bg-slate-300 transition-colors;
}

.label {
    @apply text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1;
}

.input {
    @apply w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-slate-700 font-medium;
}

.input-sub {
    @apply w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none transition-all focus:border-blue-400 text-sm font-medium placeholder:text-slate-300 shadow-sm;
}

.lesson-card {
    @apply p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:border-white;
}

.drop-zone {
    @apply relative border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer;
}

.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl font-black transition-all active:scale-95 text-sm uppercase tracking-widest;
}

.btn-add {
    @apply flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl border border-blue-100;
}

/* Entry Animation */
.animate-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.98);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
