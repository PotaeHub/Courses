<script setup>
import { ref, onMounted } from 'vue'
import api from '../../service/api.js' // axios instance

const loading = ref(true)
const updating = ref(false)
const teacher = ref(null)
const form = ref({
    image: null, // สำหรับไฟล์
    name: '',
    subject: '',
    experience: 0,
    phone: ''
})

// ดึงข้อมูล profile
const fetchProfile = async () => {
    loading.value = true
    try {
        const res = await api.get('/teacher/profile')
        teacher.value = res.data
        form.value = {
            image: null, // เริ่มเป็น null
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

// อัปโหลด profile + รูป
const updateProfile = async () => {
    updating.value = true
    try {
        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('subject', form.value.subject)
        formData.append('experience', form.value.experience)
        formData.append('phone', form.value.phone)
        if (form.value.image) {
            formData.append('image', form.value.image)
        }

        const res = await api.put('/teacher/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        alert(res.data.message)
        fetchProfile()
    } catch (err) {
        console.error(err)
        alert('Update failed')
    } finally {
        updating.value = false
    }
}

// เมื่อเลือกไฟล์
const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) form.value.image = file
}

onMounted(fetchProfile)
</script>

<template>
    <div class="p-6 max-w-xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Teacher Profile</h1>

        <div v-if="loading" class="text-gray-500">Loading...</div>

        <div v-else>
            <!-- รูปโปรไฟล์ -->
            <div class="mb-6">
                <label class="block font-semibold mb-1">Profile Image</label>
                <div class="mb-2">
                    <img v-if="form.image" :src="URL.createObjectURL(form.image)"
                        class="w-32 h-32 object-cover rounded-full border" />
                    <img v-else-if="teacher.image" :src="teacher.image"
                        class="w-32 h-32 object-cover rounded-full border" />
                    <div v-else
                        class="w-32 h-32 bg-gray-200 rounded-full border flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                </div>
                <input type="file" @change="handleFileChange" class="border p-2 w-full rounded" />
            </div>

            <!-- ฟิลด์อื่น ๆ -->
            <div class="mb-6">
                <label class="block font-semibold mb-1">Name</label>
                <input v-model="form.name" class="border p-2 w-full rounded" />
            </div>

            <div class="mb-6">
                <label class="block font-semibold mb-1">Subject</label>
                <input v-model="form.subject" class="border p-2 w-full rounded" />
            </div>

            <div class="mb-6">
                <label class="block font-semibold mb-1">Experience (years)</label>
                <input type="number" v-model="form.experience" class="border p-2 w-full rounded" />
            </div>

            <div class="mb-6">
                <label class="block font-semibold mb-1">Phone</label>
                <input v-model="form.phone" class="border p-2 w-full rounded" />
            </div>

            <button @click="updateProfile" :disabled="updating"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                {{ updating ? 'Updating...' : 'Update Profile' }}
            </button>

            <hr class="my-6" />

            <h2 class="text-xl font-bold mb-2">Courses Taught</h2>
            <ul>
                <li v-for="course in teacher.coursesTaught" :key="course.id" class="border p-2 rounded mb-2">
                    <div class="font-semibold">{{ course.title }}</div>
                    <div class="text-gray-500">Status: {{ course.status }}</div>
                </li>
            </ul>
        </div>
    </div>
</template>
