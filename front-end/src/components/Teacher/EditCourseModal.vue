<script setup>
import { ref } from 'vue'
import api from '../../service/api'
import { X, Upload, Plus, Trash2, PlayCircle } from 'lucide-vue-next'

const props = defineProps({ course: Object, categories: Array })
const emit = defineEmits(['close', 'updated'])

const loading = ref(false)

// ------------------ FORM ------------------
const form = ref({
    id: props.course.id,
    title: props.course.name || '',
    description: props.course.description || '',
    price: props.course.price || 0,
    status: props.course.status || 'DRAFT',
    categoryId: props.course.category?.id || null,
    image: props.course.image || null
})

// ------------------ FILES ------------------
const getFileUrl = path =>
    path ? (path.startsWith('http') ? path : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${path}`) : null

const imagePreview = ref(form.value.image ? getFileUrl(form.value.image) : null)
const imageFile = ref(null)
const isDraggingImage = ref(false)
const deletedLessons = ref([])
// ------------------ LESSONS ------------------
const lessons = ref(
    props.course.lessons.map(l => ({
        id: l.id,
        title: l.title,
        content: l.content,
        videoFile: null,
        videoUrl: l.videos[0] ? getFileUrl(l.videos[0].url) : null,
        isDragging: false
    }))
)


// ------------------ HANDLERS ------------------
const onImageChange = e => {
    const f = e.target.files[0]
    if (f) {
        imageFile.value = f
        imagePreview.value = URL.createObjectURL(f)
    }
}

const onImageDrop = e => {
    const f = e.dataTransfer.files[0]
    if (f) {
        imageFile.value = f
        imagePreview.value = URL.createObjectURL(f)
    }
}

const handleVideoFile = (index, files) => {
    const file = files[0]
    if (!file) return

    // ถ้า lesson มี videoUrl เดิม ให้ mark เป็น videoReplace
    if (lessons.value[index].videoUrl && lessons.value[index].videoUrl.startsWith('http')) {
        lessons.value[index].replaceVideo = true
    }

    lessons.value[index].videoFile = file
    lessons.value[index].videoUrl = URL.createObjectURL(file)
}


const addLesson = () =>
    lessons.value.push({
        id: null,
        title: '',
        content: '',
        videoFile: null,
        videoUrl: null,
        isDragging: false
    })

const removeLesson = i => {
    const lesson = lessons.value[i]
    if (lesson.id) deletedLessons.value.push(lesson.id)
    lessons.value.splice(i, 1)
}

// ------------------ SUBMIT ------------------
const submit = async () => {
    loading.value = true
    try {
        const payload = new FormData()
        payload.append('title', form.value.title)
        payload.append('description', form.value.description)
        payload.append('price', form.value.price)
        payload.append('status', form.value.status)
        payload.append('categoryId', form.value.categoryId || '')

        if (imageFile.value) payload.append('image', imageFile.value)

        // map lessons
        const cleanLessons = lessons.value.map(l => ({
            id: l.id,
            title: l.title,
            content: l.content
        }))
        payload.append('lessons', JSON.stringify(cleanLessons))

        // append lesson videos
        lessons.value.forEach((l, i) => {
            if (l.videoFile) payload.append(`video_lesson_${i}`, l.videoFile)
            if (l.replaceVideo) payload.append(`replace_video_lesson_${i}`, '1') // flag บอก backend ให้ลบ video เก่า
        })

        // append deleted lesson ids
        if (deletedLessons.value.length) {
            payload.append('deletedLessons', JSON.stringify(deletedLessons.value))
        }

        await api.put(`/teacher/course/${form.value.id}`, payload)
        emit('updated')
        emit('close')
    } catch (err) {
        console.error(err)
        alert('แก้ไขคอร์สไม่สำเร็จ')
    } finally {
        loading.value = false
    }
}

</script>

<template>
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
            class="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in duration-300">

            <!-- Header -->
            <div class="flex items-center justify-between p-8 border-b border-slate-50">
                <div>
                    <h2 class="text-3xl font-black text-slate-900 tracking-tight">Edit Course</h2>
                    <p class="text-slate-500 font-medium">จัดการข้อมูลและเนื้อหาปัจจุบันของคุณ</p>
                </div>
                <button @click="$emit('close')"
                    class="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X :size="24" />
                </button>
            </div>

            <div class="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar bg-slate-50/20">

                <!-- Left -->
                <div class="lg:col-span-7 space-y-6">

                    <!-- Course Details -->
                    <div class="space-y-4">
                        <label class="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Course
                            Details</label>
                        <input v-model="form.title" class="input-modern" placeholder="Course title" />
                        <textarea v-model="form.description" class="input-modern h-32 resize-none"
                            placeholder="Description" />

                        <div class="mt-4">
                            <label
                                class="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                            <select v-model="form.categoryId" class="input-modern">
                                <option :value="null">-- Select Category --</option>
                                <option v-for="cat in props.categories" :key="cat.id" :value="cat.id">{{ cat.name }}
                                </option>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <div class="relative">
                                <span
                                    class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">฿</span>
                                <input v-model="form.price" type="number" class="input-modern pl-10"
                                    placeholder="Price" />
                            </div>
                            <select v-model="form.status" class="input-modern">
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                    </div>

                    <hr class="border-slate-100" />

                    <!-- Lessons -->
                    <div class="space-y-4">
                        <div class="flex justify-between items-center px-2">
                            <h3 class="text-lg font-black text-slate-800">Lessons ({{ lessons.length }})</h3>
                            <button @click="addLesson"
                                class="flex items-center gap-2 text-blue-600 font-black bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                                <Plus :size="18" stroke-width="3" /> Add Lesson
                            </button>
                        </div>

                        <div v-for="(lesson, index) in lessons" :key="index"
                            class="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                            <div class="flex justify-between items-center">
                                <span
                                    class="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500">LESSON
                                    {{ index + 1 }}</span>
                                <button @click="removeLesson(index)"
                                    class="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 :size="18" />
                                </button>
                            </div>

                            <input v-model="lesson.title" class="input-sub" placeholder="Lesson title" />
                            <textarea v-model="lesson.content" class="input-sub h-20 resize-none"
                                placeholder="Lesson content" />

                            <!-- Video Upload -->
                            <div @dragover.prevent="lesson.isDragging = true"
                                @dragleave.prevent="lesson.isDragging = false"
                                @drop.prevent="e => { lesson.isDragging = false; handleVideoFile(index, e.dataTransfer.files) }"
                                class="relative aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all"
                                :class="lesson.isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'">

                                <template v-if="lesson.videoUrl">
                                    <div class="relative aspect-video w-full h-full">
                                        <video :src="lesson.videoUrl" controls class="w-full h-full object-cover" />
                                        <button @click="() => { lesson.videoFile = null; lesson.videoUrl = null }"
                                            class="absolute top-1 right-1 bg-white p-1 rounded-full">
                                            <X size="14" />
                                        </button>
                                    </div>
                                </template>

                                <div v-else
                                    class="flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                                    <PlayCircle :size="40" stroke-width="1.5" />
                                    <p class="text-xs font-black mt-2 uppercase tracking-widest">Drag Video or Click</p>
                                    <input type="file" accept="video/*"
                                        class="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto"
                                        @change="e => handleVideoFile(index, e.target.files)" />
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                <!-- Right -->
                <div class="lg:col-span-5 space-y-6">
                    <div class="sticky top-0 space-y-6">
                        <div class="space-y-4">
                            <label class="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Course
                                Cover</label>
                            <div @dragover.prevent="isDraggingImage = true" @dragleave.prevent="isDraggingImage = false"
                                @drop.prevent="onImageDrop"
                                class="relative aspect-[4/3] border-3 border-dashed rounded-[2.5rem] transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner"
                                :class="isDraggingImage ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50'">
                                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                                <div v-else class="text-center text-slate-300">
                                    <Upload class="mx-auto mb-2" :size="48" stroke-width="1" />
                                    <p class="text-xs font-black uppercase tracking-tighter">Drop New Cover Here</p>
                                </div>
                                <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer"
                                    @change="onImageChange" />
                                <button v-if="imagePreview" @click.stop="imagePreview = null; imageFile = null"
                                    class="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-red-500">
                                    <Trash2 :size="18" />
                                </button>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                            <button @click="submit" :disabled="loading" class="btn-primary w-full">
                                <span v-if="loading"
                                    class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                                {{ loading ? 'Updating...' : 'Save Changes' }}
                            </button>
                            <button @click="$emit('close')" class="btn-secondary w-full">Cancel</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
@import 'tailwindcss';

.input-modern {
    @apply w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent font-bold text-slate-700 outline-none transition-all focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50;
}

.input-sub {
    @apply w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50/50 font-bold text-sm outline-none focus:bg-white focus:border-blue-200;
}

.btn-primary {
    @apply py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center;
}

.btn-secondary {
    @apply py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 rounded-full;
}
</style>
