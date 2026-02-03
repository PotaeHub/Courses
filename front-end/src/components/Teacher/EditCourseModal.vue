<script setup>
import { ref } from 'vue'
import api from '../../service/api'
import { X, Plus, Trash2, Upload, PlayCircle } from 'lucide-vue-next'

/* ================= ENV ================= */
const BACKEND = import.meta.env.VITE_BACKEND_URL

/* ================= PROPS ================= */
const props = defineProps({
    course: { type: Object, required: true },
    categories: { type: Array, required: true }
})
const emit = defineEmits(['close', 'updated'])

/* ================= STATE ================= */
const loading = ref(false)

/* ---------- IMAGE ---------- */
const imageFile = ref(null)
const imagePreview = ref(
    props.course?.image ? BACKEND + props.course.image : null
)
const isDraggingImage = ref(false)

/* ---------- FORM ---------- */
const form = ref({
    id: props.course.id,
    title: props.course.title ?? '',
    description: props.course.description ?? '',
    price: props.course.price ?? '',
    status: props.course.status ?? 'DRAFT',
    categoryId: props.course.categoryId ?? '',
    preTestUrl: props.course.preTestUrl ?? '',
    postTestUrl: props.course.postTestUrl ?? ''
})

/* ---------- LESSONS ---------- */
const lessons = ref(
    (props.course.lessons ?? []).map(l => ({
        id: l.id,
        title: l.title,
        content: l.content,
        videoFile: null,
        videoPreview: l.videos?.[0]?.url
            ? BACKEND + l.videos[0].url
            : null,
        replaceVideo: false,
        isDragging: false
    }))
)

/* ================= HELPERS ================= */
const isGoogleFormUrl = (url) => {
    if (!url) return true
    return url.startsWith('https://docs.google.com/forms')
}

/* ================= IMAGE ================= */
const onImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}

const onImageDrop = (e) => {
    isDraggingImage.value = false
    const file = e.dataTransfer.files[0]
    if (!file) return
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}

/* ================= LESSON ================= */
const addLesson = () => {
    lessons.value.push({
        id: null,
        title: '',
        content: '',
        videoFile: null,
        videoPreview: null,
        replaceVideo: false,
        isDragging: false
    })
}

const removeLesson = (index) => {
    lessons.value.splice(index, 1)
}

const handleVideoFile = (index, files) => {
    const file = files[0]
    if (!file) return
    lessons.value[index].videoFile = file
    lessons.value[index].videoPreview = URL.createObjectURL(file)
    lessons.value[index].replaceVideo = true
}

/* ================= SUBMIT ================= */
const submit = async () => {
    if (!isGoogleFormUrl(form.value.preTestUrl))
        return alert('Pre-test ต้องเป็น Google Form')

    if (!isGoogleFormUrl(form.value.postTestUrl))
        return alert('Post-test ต้องเป็น Google Form')

    loading.value = true
    try {
        const fd = new FormData()
        fd.append('title', form.value.title)
        fd.append('description', form.value.description)
        fd.append('price', form.value.price)
        fd.append('status', form.value.status)
        fd.append('categoryId', form.value.categoryId)
        fd.append('preTestUrl', form.value.preTestUrl)
        fd.append('postTestUrl', form.value.postTestUrl)

        if (imageFile.value) {
            fd.append('image', imageFile.value)
        }

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
        console.error(err)
        alert('Update failed')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">

            <!-- HEADER -->
            <div class="flex items-center justify-between p-8 border-b">
                <div>
                    <h2 class="text-3xl font-black">Edit Course</h2>
                    <p class="text-slate-500">จัดการข้อมูลคอร์สของคุณ</p>
                </div>
                <button @click="$emit('close')" class="p-3 hover:bg-slate-100 rounded-full">
                    <X />
                </button>
            </div>

            <div class="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto">

                <!-- LEFT -->
                <div class="lg:col-span-7 space-y-6">
                    <input v-model="form.title" class="input-modern" placeholder="Course title" />
                    <textarea v-model="form.description" class="input-modern h-32" placeholder="Description" />

                    <select v-model="form.categoryId" class="input-modern">
                        <option value="">-- Select Category --</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>

                    <input v-model="form.price" type="number" class="input-modern" placeholder="Price" />
                    <input v-model="form.preTestUrl" class="input-modern" placeholder="Pre-test (Google Form)" />
                    <input v-model="form.postTestUrl" class="input-modern" placeholder="Post-test (Google Form)" />

                    <!-- LESSONS -->
                    <div class="space-y-4">
                        <div class="flex justify-between">
                            <h3 class="font-black">Lessons</h3>
                            <button @click="addLesson" class="btn-secondary flex gap-2">
                                <Plus /> Add
                            </button>
                        </div>

                        <div v-for="(lesson, index) in lessons" :key="index" class="border rounded-2xl p-4 space-y-3">
                            <input v-model="lesson.title" class="input-sub" placeholder="Lesson title" />
                            <textarea v-model="lesson.content" class="input-sub h-20" />

                            <div class="aspect-video bg-slate-100 rounded-xl overflow-hidden">
                                <video v-if="lesson.videoPreview" :src="lesson.videoPreview" controls
                                    class="w-full h-full" />
                                <input v-else type="file" accept="video/*"
                                    class="w-full h-full opacity-0 cursor-pointer"
                                    @change="e => handleVideoFile(index, e.target.files)" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT -->
                <div class="lg:col-span-5 space-y-6">
                    <div class="aspect-[4/3] border-dashed border-2 rounded-2xl overflow-hidden relative">
                        <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                        <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer"
                            @change="onImageChange" />
                    </div>

                    <button @click="submit" :disabled="loading" class="btn-primary w-full">
                        {{ loading ? 'Saving...' : 'Save Changes' }}
                    </button>
                    <button @click="$emit('close')" class="btn-secondary w-full">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";

.input-modern {
    @apply w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold;
}

.input-sub {
    @apply w-full px-4 py-2 rounded-xl bg-slate-50 text-sm;
}

.btn-primary {
    @apply py-4 bg-blue-600 text-white rounded-2xl font-black;
}

.btn-secondary {
    @apply py-3 bg-slate-100 rounded-xl font-bold;
}
</style>
