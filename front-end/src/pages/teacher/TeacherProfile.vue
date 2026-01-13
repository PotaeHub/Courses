<script setup>
import { ref, onMounted } from 'vue'
import { User, BookOpen, Clock, Phone, Camera, Video, Save, CheckCircle2 } from 'lucide-vue-next'
import api from '../../service/api.js'

const loading = ref(false)
const saved = ref(false)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const form = ref({ name: '', subject: '', experience: '', phone: '' })
const files = ref({ image: null, video: null })
const preview = ref({ image: null, video: null })

const fetchTeacher = async () => {
    try {
        const res = await api.get('/teacher/profile')
        const teacher = res.data.teacher || res.data
        form.value = {
            name: teacher.name || '',
            subject: teacher.teacherProfile?.subject || '',
            experience: teacher.teacherProfile?.experience || '',
            phone: teacher.teacherProfile?.phone || ''
        }
        preview.value = {
            image: teacher.image ? `${BACKEND_URL}${teacher.image}` : null,
            video: teacher.video ? `${BACKEND_URL}${teacher.video}` : null
        }
        files.value = { image: null, video: null }
    } catch (err) {
        console.error(err)
    }
}

const handleFileChange = (type, e) => {
    const file = e.target.files[0]
    if (!file) return
    files.value[type] = file
    const reader = new FileReader()
    reader.onload = () => preview.value[type] = reader.result
    reader.readAsDataURL(file)
}

const submitForm = async () => {
    loading.value = true
    saved.value = false
    try {
        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('subject', form.value.subject)
        formData.append('experience', form.value.experience)
        formData.append('phone', form.value.phone)
        if (files.value.image) formData.append('image', files.value.image)
        if (files.value.video) formData.append('video', files.value.video)

        await api.put('/teacher/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        saved.value = true
        setTimeout(() => saved.value = false, 3000)
        await fetchTeacher()
    } catch (err) {
        console.error(err)
        alert('Update failed')
    } finally {
        loading.value = false
    }
}

onMounted(fetchTeacher)
</script>
<template>
    <div class="min-h-screen bg-[#fcfcfd] py-12 px-4">
        <div class="max-w-2xl mx-auto">

            <!-- หัวเรื่องหน้า -->
            <div class="mb-8 text-center">
                <h1 class="text-3xl font-bold text-slate-800">แก้ไขโปรไฟล์</h1>
                <p class="text-slate-500 mt-1">อัปเดตข้อมูลของคุณให้เป็นปัจจุบัน</p>
            </div>

            <div class="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
                <form @submit.prevent="submitForm">

                    <!-- รูปโปรไฟล์ -->
                    <div class="p-8 text-center bg-slate-50/50 border-b border-slate-100">
                        <div class="relative inline-block group">
                            <div
                                class="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                                <img v-if="preview.image" :src="preview.image" class="w-full h-full object-cover" />
                                <div v-else
                                    class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 text-2xl font-bold">
                                    {{ form.name.charAt(0) || '?' }}
                                </div>
                            </div>
                            <label
                                class="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                                <Camera class="w-4 h-4 text-slate-600" />
                                <input type="file" @change="handleFileChange('image', $event)" class="hidden"
                                    accept="image/*" />
                            </label>
                        </div>
                        <p class="mt-3 text-sm font-medium text-slate-500">รูปโปรไฟล์</p>
                    </div>

                    <div class="p-8 space-y-6">

                        <div class="space-y-1.5">
                            <label class="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</label>
                            <input v-model="form.name" type="text" class="simple-input" placeholder="ชื่อเต็มของคุณ" />
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-sm font-semibold text-slate-700">วิชาเอก</label>
                                <input v-model="form.subject" type="text" class="simple-input"
                                    placeholder="เช่น วิทยาศาสตร์" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-sm font-semibold text-slate-700">ประสบการณ์ (ปี)</label>
                                <input v-model="form.experience" type="number" class="simple-input" placeholder="0" />
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-sm font-semibold text-slate-700">เบอร์โทร</label>
                            <input v-model="form.phone" type="text" class="simple-input" placeholder="08x-xxx-xxxx" />
                        </div>

                        <div class="space-y-1.5 pt-2">
                            <label class="text-sm font-semibold text-slate-700">วิดีโอแนะนำตัว</label>

                            <div v-if="preview.video"
                                class="mt-2 relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                                <video :src="preview.video" controls class="w-full aspect-video"></video>
                                <button type="button" @click="preview.video = null; files.video = null"
                                    class="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70">
                                    <span class="text-xs px-1">ลบ</span>
                                </button>
                            </div>

                            <label v-else
                                class="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
                                <Video class="w-6 h-6 text-slate-400" />
                                <span
                                    class="mt-2 text-xs font-medium text-slate-500">คลิกเพื่ออัปโหลดวิดีโอแนะนำตัว</span>
                                <input type="file" @change="handleFileChange('video', $event)" class="hidden"
                                    accept="video/*" />
                            </label>
                        </div>
                    </div>

                    <div class="px-8 pb-8">
                        <button type="submit" :disabled="loading"
                            class="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-sm"
                            :class="saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'">
                            <template v-if="loading">
                                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin">
                                </div>
                                <span>กำลังอัปเดต...</span>
                            </template>
                            <template v-else-if="saved">
                                <CheckCircle2 class="w-5 h-5" />
                                <span>อัปเดตเรียบร้อย!</span>
                            </template>
                            <template v-else>
                                <Save class="w-5 h-5" />
                                <span>บันทึกการเปลี่ยนแปลง</span>
                            </template>
                        </button>
                    </div>

                </form>
            </div>

            <p class="mt-6 text-center text-sm text-slate-400">
                มีปัญหา? <a href="#" class="text-blue-500 hover:underline">ติดต่อฝ่ายสนับสนุน</a>
            </p>
        </div>
    </div>
</template>


<style scoped>
@import "tailwindcss";

.simple-input {
    @apply w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300;
}

/* Hide Spinners for Number Input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>