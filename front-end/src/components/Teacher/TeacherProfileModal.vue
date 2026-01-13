<script setup>
import { ref, watch } from 'vue'
import api from '../../service/api.js'

const props = defineProps({
    show: Boolean,
    teacher: Object
})
const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// form data
const form = ref({ name: '', subject: '', experience: '', phone: '' })
const files = ref({ image: null, video: null })
const preview = ref({ image: null, video: null })

// watch props.teacher เพื่อโหลดค่าเดิม
watch(
    () => props.teacher,
    (newTeacher) => {
        if (!newTeacher) return
        form.value = {
            name: newTeacher.name || '',
            subject: newTeacher.teacherProfile?.subject || '',
            experience: newTeacher.teacherProfile?.experience || '',
            phone: newTeacher.teacherProfile?.phone || ''
        }
        preview.value = {
            image: newTeacher.image ? `${BACKEND_URL}${newTeacher.image}` : null,
            video: newTeacher.video ? `${BACKEND_URL}${newTeacher.video}` : null
        }
        files.value = { image: null, video: null }
    },
    { immediate: true }
)

// handle file change
const handleFileChange = (type, e) => {
    const file = e.target.files[0]
    if (!file) return
    files.value[type] = file

    const reader = new FileReader()
    reader.onload = () => preview.value[type] = reader.result
    reader.readAsDataURL(file)
}

// submit form
const submitForm = async () => {
    loading.value = true
    try {
        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('subject', form.value.subject)
        formData.append('experience', form.value.experience)
        formData.append('phone', form.value.phone)

        if (files.value.image) formData.append('image', files.value.image)
        if (files.value.video) formData.append('video', files.value.video)

        const res = await api.put('/teacher/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        emit('updated', res.data.teacher)
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
    <Transition name="fade">
        <div v-if="show" class="fixed inset-0 z-[60] overflow-y-auto">
            <!-- backdrop -->
            <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')">
            </div>

            <!-- modal -->
            <div class="flex min-h-full items-center justify-center p-4">
                <div
                    class="relative w-full max-w-xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
                    <!-- header -->
                    <div class="px-8 pt-8 pb-4 flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-800">Edit Profile</h2>
                            <p class="text-sm text-slate-500">Update your professional information</p>
                        </div>
                        <button @click="$emit('close')"
                            class="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <span class="text-xl">✕</span>
                        </button>
                    </div>

                    <!-- form -->
                    <form @submit.prevent="submitForm" class="p-8 pt-2 space-y-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full
                                    Name</label>
                                <input v-model="form.name" type="text" placeholder="e.g. Dr. John Doe"
                                    class="modern-input" />
                            </div>

                            <div class="col-span-1">
                                <label
                                    class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                                <input v-model="form.subject" type="text" placeholder="Mathematics"
                                    class="modern-input" />
                            </div>

                            <div class="col-span-1">
                                <label
                                    class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience
                                    (Yrs)</label>
                                <input v-model="form.experience" type="number" placeholder="5" class="modern-input" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone
                                Number</label>
                            <input v-model="form.phone" type="text" placeholder="08x-xxx-xxxx" class="modern-input" />
                        </div>

                        <hr class="border-slate-100" />

                        <!-- Image & Video Upload -->
                        <div class="space-y-4">
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Profile &
                                Intro Video</label>
                            <div class="flex items-start gap-6">
                                <!-- Image -->
                                <div class="relative group cursor-pointer">
                                    <div
                                        class="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 group-hover:border-blue-500 transition-colors relative">
                                        <img v-if="preview.image" :src="preview.image"
                                            class="w-full h-full object-cover" />
                                        <div v-else
                                            class="flex flex-col items-center justify-center h-full text-slate-400">
                                            <span class="text-[10px] text-center px-2">Photo</span>
                                        </div>
                                        <input type="file" accept="image/*"
                                            class="absolute inset-0 opacity-0 cursor-pointer"
                                            @change="handleFileChange('image', $event)" />
                                    </div>
                                </div>

                                <!-- Video -->
                                <div class="flex-1">
                                    <div
                                        class="relative h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all flex items-center justify-center px-4 overflow-hidden group">
                                        <video v-if="preview.video" :src="preview.video"
                                            class="absolute inset-0 w-full h-full object-cover opacity-30"></video>
                                        <div class="relative z-10 text-center">
                                            <p class="text-xs font-medium text-slate-600">{{ files.video ?
                                                files.video.name : 'Click to upload intro video' }}</p>
                                            <p class="text-[10px] text-slate-400">MP4, WebM (Max 50MB)</p>
                                        </div>
                                        <input type="file" accept="video/*"
                                            class="absolute inset-0 opacity-0 cursor-pointer"
                                            @change="handleFileChange('video', $event)" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- submit -->
                        <div class="pt-4">
                            <button type="submit" :disabled="loading"
                                class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <span v-if="loading"
                                    class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {{ loading ? 'Saving Changes...' : 'Save Profile' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
@import "tailwindcss";

.modern-input {
    @apply w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 transition-all outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes zoom-in-95 {
    from {
        transform: scale(0.95);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-in {
    animation: zoom-in-95 0.2s ease-out;
}
</style>
