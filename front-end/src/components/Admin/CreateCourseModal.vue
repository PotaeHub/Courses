<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../service/api.js'
import {
    X, Plus, Trash2, Image as ImageIcon,
    CheckCircle2, Layout,
} from 'lucide-vue-next'

/* ---------- PROPS & EMITS ---------- */
const emit = defineEmits(['close', 'created'])

const preview = ref(null);
const categories = ref([])
const loading = ref(false)
let imagePreviewUrl = null
const form = ref({
    title: '',
    description: '',
    price: '',
    type: 'GENERAL',
    categoryId: '',
    imageFile: null,
    lessons: [], // { title, content, videoFile, videoFileName }
})

const newLesson = ref({
    title: '',
    content: '',
    videoFile: null,
})

const resetForm = () => {
    form.value = {
        title: '',
        description: '',
        price: '',
        type: 'GENERAL',
        categoryId: '',
        imageFile: null,
        lessons: [],
    }
    newLesson.value = { title: '', content: '' }
}

/* ---------- LESSON ---------- */
const addLesson = () => {
    console.log('Adding lesson:', form.value);
    if (!newLesson.value.title) {
        alert('กรุณากรอกหัวข้อบทเรียน')
        return
    }
    const exists = form.value.lessons.some(l => l.title === newLesson.value.title)
    if (exists) {
        alert('บทเรียนนี้มีอยู่แล้ว')
        return
    }

    form.value.lessons.push({
        title: newLesson.value.title,
        content: newLesson.value.content,
        videoFile: newLesson.value.videoFile || null,
        videoFileName: newLesson.value.videoFile ? newLesson.value.videoFile.name : null,
        sortOrder: form.value.lessons.length + 1
    })

    newLesson.value = { title: '', content: '', videoFile: null }
}
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

const removeLesson = (index) => {
    form.value.lessons.splice(index, 1)
    form.value.lessons.forEach((l, i) => {
        l.sortOrder = i + 1
    })
}
// ---------- FILE HANDLERS ----------
const handleImageFile = (e) => {
    const file = e.target.files[0];
    form.value.imageFile = file || null;
    preview.value = file ? URL.createObjectURL(file) : null;
}
const handleVideoFile = (e) => {
    newLesson.value.videoFile = e.target.files[0] || null;
}
/* ---------- API ---------- */
onMounted(async () => {
    const res = await api.get('/admin/category')
    categories.value = res.data.category
})

const submit = async () => {
    if (loading.value) return;
    if (!form.value.title.trim()) return alert('กรุณากรอกชื่อคอร์ส');
    if (!form.value.categoryId) return alert('กรุณาเลือกหมวดหมู่คอร์ส');
    if (!form.value.price || form.value.price <= 0) return alert('กรุณากรอกราคาคอร์สที่ถูกต้อง');

    try {
        loading.value = true;

        const formData = new FormData();
        formData.append("title", form.value.title);
        formData.append("description", form.value.description || "");
        formData.append("price", form.value.price);
        formData.append("type", form.value.type);
        formData.append("categoryId", form.value.categoryId);

        // image
        if (form.value.imageFile) formData.append("image", form.value.imageFile);

        // lessons JSON
        const lessonsJson = form.value.lessons.map(l => ({
            title: l.title,
            content: l.content,
            sortOrder: l.sortOrder,
            videoFileName: l.videoFile ? l.videoFile.name : null,
        }));
        formData.append("lessons", JSON.stringify(lessonsJson));

        form.value.lessons.forEach((lesson, index) => {
            if (lesson.videoFile) {
                formData.append("lessonVideos", lesson.videoFile);
            }
        });

        await api.post("/admin/courses", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        emit('created');
        resetForm();
        emit('close');
    } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการสร้างคอร์ส');
    } finally {
        loading.value = false;
    }
}

</script>

<template>
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div
            class="bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col transition-all">

            <div class="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div>
                    <h2 class="text-2xl font-black text-slate-800 tracking-tight">สร้างคอร์สใหม่</h2>
                    <p class="text-sm text-slate-400 font-medium mt-1">ตั้งค่ารายละเอียดคอร์สและบทเรียนของคุณ</p>
                </div>
                <button @click="$emit('close')"
                    class="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-colors">
                    <X :size="24" />
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 bg-[#FBFBFE]">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div class="lg:col-span-5 space-y-6">
                        <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
                            <h3
                                class="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
                                <Layout :size="14" /> General Info
                            </h3>

                            <div class="space-y-2">
                                <label
                                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อคอร์ส</label>
                                <input v-model="form.title" placeholder="เช่น Advanced Vue.js 2024"
                                    class="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-700 transition-all" />
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label
                                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หมวดหมู่</label>
                                    <select v-model="form.categoryId"
                                        class="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none appearance-none">
                                        <option value="">เลือก</option>
                                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label
                                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ราคา</label>
                                    <input v-model="form.price" type="number"
                                        class="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-700" />
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label
                                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รายละเอียด</label>
                                <textarea v-model="form.description" rows="3" placeholder="เขียนคำอธิบายสั้นๆ..."
                                    class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium text-slate-600 resize-none"></textarea>
                            </div>

                            <div class="space-y-2">
                                <label
                                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image
                                    URL</label>
                                <div class="relative flex items-center">
                                    <ImageIcon class="absolute left-4 text-slate-300" :size="18" />

                                    <!-- ถ้า preview image -->
                                    <img v-if="courseImageUrl" :src="courseImageUrl" alt="Preview"
                                        class="absolute right-4 w-16 h-16 object-cover rounded-xl" />

                                    <input type="file" @change="handleImageFile" class="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl outline-none
                                    text-xs font-mono text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-7 space-y-6">
                        <div
                            class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm border-l-4 border-l-green-400">
                            <button type="button" @click="addLesson" class="text-xs font-black uppercase tracking-widest text-green-500 mb-4 flex
                                items-center gap-2">
                                <Plus :size="14" /> Add New Lesson
                            </button>
                            <div class="space-y-3">
                                <input v-model="newLesson.title" @keyup.enter="addLesson" placeholder="หัวข้อบทเรียน"
                                    class="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold" />
                                <textarea v-model="newLesson.content" placeholder="เนื้อหาหรือลิงก์วิดีโอ..."
                                    class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm min-h-[80px] resize-none"></textarea>
                                <input type="file" @change="handleVideoFile" />
                                <button @click="addLesson" :disabled="!newLesson.title"
                                    class="w-full py-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                                    Add to Course List
                                </button>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div v-if="form.lessons.length === 0"
                                class="py-10 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                <p class="text-slate-300 text-xs font-bold uppercase tracking-widest">
                                    ยังไม่มีบทเรียนในคอร์สนี้</p>
                            </div>

                            <div v-for="(lesson, index) in form.lessons" :key="index"
                                class="group bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all">
                                <div
                                    class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">
                                    {{ lesson.sortOrder }}
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-bold text-slate-700 leading-tight">{{ lesson.title }}</p>
                                    <p class="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">{{ lesson.content
                                    }}</p>
                                </div>
                                <button @click="removeLesson(index)"
                                    class="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 :size="18" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="p-8 border-t border-slate-50 bg-white flex justify-end gap-4">
                <button @click="$emit('close')"
                    class="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">
                    Discard changes
                </button>
                <button @click="submit" :disabled="loading || !form.categoryId || form.lessons.length === 0" class="px-10 py-4 rounded-2xl font-black text-sm bg-gray-900 text-white shadow-xl shadow-gray-200
                    hover:bg-blue-600 hover:shadow-blue-100 transition-all active:scale-95 flex items-center gap-2">
                    <CheckCircle2 v-if="!loading" :size="18" />
                    <span>{{ loading ? 'กำลังบันทึก...' : 'Publish Course' }}</span>
                </button>
            </div>

        </div>
    </div>
</template>