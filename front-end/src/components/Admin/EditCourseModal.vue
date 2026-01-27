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
        class="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-[8px] p-4 animate-in fade-in zoom-in-95 duration-300">
        <div
            class="bg-white/95 w-full max-w-6xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col max-h-[92vh] overflow-hidden border border-white relative">

            <div
                class="px-10 py-7 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white">
                <div class="flex items-center gap-5">
                    <div
                        class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Edit <span
                                class="text-blue-600">Course</span></h2>
                        <p class="text-[13px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Content
                            Management System</p>
                    </div>
                </div>
                <button @click="emit('close')"
                    class="group p-3 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all duration-300 active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                        class="group-hover:rotate-90 transition-transform">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    <div class="lg:col-span-8 space-y-12">

                        <div class="space-y-8">
                            <h3
                                class="flex items-center gap-3 text-slate-800 font-black uppercase tracking-[0.2em] text-[11px]">
                                <span class="w-8 h-[2px] bg-blue-600 rounded-full"></span>
                                General Information
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="md:col-span-2 group">
                                    <label class="label-modern">Course Title</label>
                                    <input v-model="form.title" class="input-modern"
                                        placeholder="e.g. Masterclass in UX Design" />
                                </div>
                                <div>
                                    <label class="label-modern">Price (THB)</label>
                                    <div class="relative group">
                                        <input v-model.number="form.price" type="number" class="input-modern pl-12" />
                                        <span
                                            class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg group-focus-within:text-blue-600 transition-colors">฿</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="label-modern">Course Category</label>
                                    <div class="relative">
                                        <select v-model="form.type" class="input-modern appearance-none cursor-pointer">
                                            <option value="GENERAL">GENERAL</option>
                                            <option value="POPULAR">POPULAR</option>
                                            <option value="PACKAGE">PACKAGE</option>
                                        </select>
                                        <div
                                            class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                                <path d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="label-modern">Description</label>
                                    <textarea v-model="form.description"
                                        class="input-modern min-h-[140px] py-5 resize-none"
                                        placeholder="Enter a compelling description for your course..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-8">
                            <div class="flex justify-between items-end">
                                <h3
                                    class="flex items-center gap-3 text-slate-800 font-black uppercase tracking-[0.2em] text-[11px]">
                                    <span class="w-8 h-[2px] bg-blue-600 rounded-full"></span>
                                    Course Curriculum
                                </h3>
                                <button @click="addLesson"
                                    class="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all duration-300 bg-blue-50 px-5 py-2.5 rounded-2xl hover:bg-blue-600 hover:text-white group">
                                    <span>Add New Lesson</span>
                                    <span
                                        class="text-xl leading-none font-light group-hover:rotate-90 transition-transform">+</span>
                                </button>
                            </div>

                            <div class="space-y-8">
                                <div v-for="(lesson, i) in form.lessons" :key="lesson._tempId"
                                    class="relative p-8 rounded-[2rem] border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-100 transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] group">

                                    <div class="flex justify-between items-center mb-8">
                                        <div class="flex items-center gap-4">
                                            <span
                                                class="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-2xl font-black text-sm shadow-xl shadow-slate-200">
                                                {{ (i + 1).toString().padStart(2, '0') }}
                                            </span>
                                            <h4 class="font-black text-slate-800 tracking-tight text-lg">Lesson Module
                                            </h4>
                                        </div>
                                        <button @click="removeLesson(i)"
                                            class="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path
                                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                                </path>
                                            </svg>
                                        </button>
                                    </div>

                                    <div class="grid gap-5">
                                        <input v-model="lesson.title" class="input-modern-sub text-lg font-bold"
                                            placeholder="Module Title..." />
                                        <textarea v-model="lesson.content" class="input-modern-sub min-h-[90px]"
                                            placeholder="What will students learn in this module?" />

                                        <div class="mt-4">
                                            <p
                                                class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
                                                Lesson Video Source</p>
                                            <div class="relative group/video overflow-hidden border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-white transition-all hover:border-blue-400"
                                                @dragover.prevent @drop="e => handleLessonVideoDrop(i, e)">
                                                <input type="file" @change="e => handleLessonVideoChange(i, e)"
                                                    class="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <div class="flex flex-col items-center justify-center gap-2 py-8">
                                                    <div
                                                        class="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover/video:bg-blue-50 transition-colors">
                                                        <svg class="w-5 h-5 text-slate-400 group-hover/video:text-blue-500"
                                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                            fill="none" stroke="currentColor" stroke-width="2.5">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                            <polyline points="17 8 12 3 7 8" />
                                                            <line x1="12" y1="3" x2="12" y2="15" />
                                                        </svg>
                                                    </div>
                                                    <span class="text-xs font-bold text-slate-500">Drag video or <span
                                                            class="text-blue-600 underline">browse</span></span>
                                                </div>

                                                <div v-if="lesson.videoFile || lesson.videoUrl" class="p-3 bg-slate-50">
                                                    <div
                                                        class="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
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
                    </div>

                    <div class="lg:col-span-4">
                        <div class="sticky top-0 space-y-10">
                            <div class="space-y-6">
                                <h3
                                    class="text-slate-800 font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                                    <span class="w-2 h-2 bg-blue-600 rounded-full"></span> Thumbnail
                                </h3>
                                <div class="relative aspect-[4/3] rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group/thumb bg-slate-100"
                                    @dragover.prevent @drop="handleImageDrop">

                                    <img v-if="courseImageUrl" :src="courseImageUrl"
                                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" />

                                    <div v-if="!courseImageUrl" class="text-center space-y-4">
                                        <div
                                            class="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-slate-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                stroke-width="1.5">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                        </div>
                                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Upload Cover</p>
                                    </div>

                                    <input type="file" @change="handleImageChange"
                                        class="absolute inset-0 opacity-0 cursor-pointer z-10" />

                                    <div
                                        class="absolute inset-0 bg-blue-600/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all duration-500">
                                        <div
                                            class="bg-white px-6 py-3 rounded-2xl font-black text-blue-600 text-[11px] uppercase tracking-tighter transform translate-y-4 group-hover/thumb:translate-y-0 transition-transform">
                                            Change Thumbnail
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden">
                                <div class="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl">
                                </div>
                                <h4 class="text-base font-black mb-6 flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="3" class="text-blue-400">
                                        <path
                                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    Expert Tips
                                </h4>
                                <ul class="space-y-5">
                                    <li class="flex items-start gap-4">
                                        <div
                                            class="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span class="text-blue-400 text-[10px] font-bold">1</span></div>
                                        <p class="text-[11px] leading-relaxed text-slate-300 font-medium">Use
                                            high-quality images (1280x720) for better conversion.</p>
                                    </li>
                                    <li class="flex items-start gap-4">
                                        <div
                                            class="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span class="text-blue-400 text-[10px] font-bold">2</span></div>
                                        <p class="text-[11px] leading-relaxed text-slate-300 font-medium">Keep videos
                                            under 15 min to maintain engagement.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div
                class="px-10 py-7 border-t border-slate-100 bg-white/95 backdrop-blur-md flex justify-between items-center relative z-20">
                <button @click="emit('close')"
                    class="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                    Discard Changes
                </button>
                <button @click="submit" :disabled="loading"
                    class="relative group overflow-hidden bg-slate-900 text-white px-10 py-4 rounded-[1.25rem] text-sm font-black tracking-widest uppercase transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] active:scale-95 disabled:opacity-50">
                    <div class="relative z-10 flex items-center gap-3">
                        <span v-if="loading"
                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        {{ loading ? 'Updating...' : 'Save & Publish' }}
                    </div>
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";

.label-modern {
    @apply block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within:text-blue-600;
}

.input-modern {
    @apply w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-700 font-bold placeholder:text-slate-300 transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-[6px] focus:ring-blue-500/5;
}

.input-modern-sub {
    @apply w-full bg-transparent border-b-2 border-slate-100 py-3 text-slate-700 font-medium placeholder:text-slate-300 transition-all focus:border-blue-500 focus:outline-none;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 rounded-full hover:bg-slate-300 transition-colors;
}

/* Animations */
.animate-in {
    animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.98) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>

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
