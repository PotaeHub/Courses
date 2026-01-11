<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { X } from 'lucide-vue-next'
import api from '../../service/api'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'updated'])

const loading = ref(true)
const updating = ref(false)
const teacher = ref({})
const form = ref({
    image: null,
    name: '',
    subject: '',
    experience: 0,
    phone: ''
})

// fetch profile
const fetchProfile = async () => {
    loading.value = true
    try {
        const res = await axios.get('/teacher/profile')
        teacher.value = res.data
        form.value = {
            image: null,
            name: teacher.value.name || '',
            subject: teacher.value.teacherProfile?.subject || '',
            experience: teacher.value.teacherProfile?.experience || 0,
            phone: teacher.value.teacherProfile?.phone || ''
        }
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

// file change
const handleFileChange = e => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) form.value.image = file
}

// update
const updateProfile = async () => {
    updating.value = true
    try {
        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('subject', form.value.subject)
        formData.append('experience', form.value.experience)
        formData.append('phone', form.value.phone)
        if (form.value.image instanceof File) formData.append('image', form.value.image)

        await api.put('/teacher/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        emit('updated')
        emit('close')
    } catch (err) {
        console.error(err)
        alert('Update failed')
    } finally {
        updating.value = false
    }
}

const close = () => emit('close')

// watch popup
watch(() => props.show, val => {
    if (val) fetchProfile()
})
</script>

<template>
    <transition name="fade">
        <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <transition name="slide-up">
                <div class="bg-white rounded-2xl w-96 p-6 relative shadow-lg">
                    <button @click="close" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                        <X size="24" />
                    </button>
                    <h2 class="text-xl font-bold mb-4 text-center">Edit Profile</h2>

                    <div v-if="loading" class="text-gray-500 text-center py-10">Loading...</div>

                    <div v-else>
                        <!-- Image preview -->
                        <div class="mb-4 text-center">
                            <div class="relative w-32 h-32 mx-auto mb-2">
                                <img v-if="form.image && form.image.constructor.name === 'File'"
                                    :src="URL.createObjectURL(form.image)"
                                    class="w-32 h-32 object-cover rounded-full border" />
                                <img v-else-if="teacher.image" :src="teacher.image"
                                    class="w-32 h-32 object-cover rounded-full border" />

                                <div v-else
                                    class="w-32 h-32 bg-gray-200 rounded-full border flex items-center justify-center text-gray-500">
                                    No Image
                                </div>
                            </div>
                            <input type="file" @change="handleFileChange" class="w-full text-sm" />
                        </div>

                        <div class="mb-3">
                            <label class="block text-sm font-medium mb-1">Name</label>
                            <input v-model="form.name" class="border p-2 w-full rounded" />
                        </div>

                        <div class="mb-3">
                            <label class="block text-sm font-medium mb-1">Subject</label>
                            <input v-model="form.subject" class="border p-2 w-full rounded" />
                        </div>

                        <div class="mb-3">
                            <label class="block text-sm font-medium mb-1">Experience (years)</label>
                            <input type="number" v-model="form.experience" class="border p-2 w-full rounded" />
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium mb-1">Phone</label>
                            <input v-model="form.phone" class="border p-2 w-full rounded" />
                        </div>

                        <button @click="updateProfile" :disabled="updating"
                            class="bg-blue-500 w-full text-white py-2 rounded hover:bg-blue-600 transition">
                            {{ updating ? 'Updating...' : 'Save Changes' }}
                        </button>
                    </div>
                </div>
            </transition>
        </div>
    </transition>
</template>

<style scoped>
@import "tailwindcss";

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-up-enter-from {
    transform: translateY(50px);
    opacity: 0;
}

.slide-up-leave-active {
    transition: transform 0.2s ease-in, opacity 0.2s ease-in;
}

.slide-up-leave-to {
    transform: translateY(50px);
    opacity: 0;
}
</style>
