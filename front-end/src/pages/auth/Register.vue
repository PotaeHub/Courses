<script setup>
import { reactive, computed } from 'vue'
import api from '../../service/api.js'

const form = reactive({
    email: '', password: '', confirmPassword: '', name: '',
    role: 'STUDENT', gradeLevel: '', classroom: '',
    subject: '', experience: null, phone: ''
})

const isPasswordMatch = computed(() => form.confirmPassword !== '' && form.password === form.confirmPassword)
const isFormValid = computed(() => {
    const common = form.email && form.password && form.name && isPasswordMatch.value;
    if (form.role === 'STUDENT') return common && form.gradeLevel && form.classroom;
    if (form.role === 'TEACHER') return common && form.subject && form.experience !== null;
    return common;
})

const handleRegister = async () => {
    try {
        if (!isPasswordMatch.value) return alert('รหัสผ่านไม่ตรงกัน');
        const { confirmPassword, ...submitData } = form;
        await api.post('/register', submitData);
        alert('สมัครสมาชิกสำเร็จ!');
        window.location.href = '/login';
    } catch (err) {
        alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
}
</script>


<template>
    <div class="max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">สร้างบัญชีใหม่</h2>

        <div class="flex mb-6 p-1 bg-gray-100 rounded-lg">
            <button @click="form.role = 'STUDENT'"
                :class="form.role === 'STUDENT' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 py-2 rounded-md font-medium transition duration-200">เป็นนักเรียน</button>
            <button @click="form.role = 'TEACHER'"
                :class="form.role === 'TEACHER' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 py-2 rounded-md font-medium transition duration-200">เป็นอาจารย์</button>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
            <input v-model="form.name" type="text" placeholder="ชื่อ-นามสกุล"
                class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                required />

            <input v-model="form.email" type="email" placeholder="อีเมล"
                class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                required />

            <div class="space-y-1">
                <input v-model="form.password" type="password" placeholder="รหัสผ่าน (6 ตัวขึ้นไป)"
                    class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                    required />
            </div>

            <div class="space-y-1">
                <input v-model="form.confirmPassword" type="password" placeholder="ยืนยันรหัสผ่าน" :class="[
                    'w-full border p-2 rounded-lg outline-none transition',
                    form.confirmPassword && !isPasswordMatch ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-400'
                ]" required />
                <p v-if="form.confirmPassword && !isPasswordMatch" class="text-red-500 text-xs pl-1">
                    * รหัสผ่านไม่ตรงกัน
                </p>
                <p v-if="form.confirmPassword && isPasswordMatch" class="text-green-500 text-xs pl-1">
                    ✓ รหัสผ่านตรงกัน
                </p>
            </div>

            <input v-model="form.phone" type="text" placeholder="เบอร์โทรศัพท์"
                class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition" />

            <div v-if="form.role === 'STUDENT'" class="space-y-4 border-t pt-4 animate-fade-in">
                <p class="text-sm font-bold text-blue-500 uppercase tracking-wider">ข้อมูลการศึกษา</p>
                <input v-model="form.gradeLevel" type="text" placeholder="ระดับชั้น (เช่น ม.6)"
                    class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" required />
                <input v-model="form.classroom" type="text" placeholder="ห้องเรียน"
                    class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>

            <div v-if="form.role === 'TEACHER'" class="space-y-4 border-t pt-4 animate-fade-in">
                <p class="text-sm font-bold text-green-500 uppercase tracking-wider">ข้อมูลอาจารย์</p>
                <input v-model="form.subject" type="text" placeholder="วิชาที่สอน"
                    class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" required />
                <input v-model="form.experience" type="number" placeholder="ประสบการณ์ (ปี)"
                    class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
            </div>

            <button type="submit" :disabled="!isFormValid"
                :class="isFormValid ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-gray-300 cursor-not-allowed'"
                class="w-full text-white py-3 rounded-lg font-bold transition duration-300 transform active:scale-95">
                ลงทะเบียนเป็น {{ form.role === 'STUDENT' ? 'นักเรียน' : 'อาจารย์' }}
            </button>
        </form>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>