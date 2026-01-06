<script setup>
import { ref } from 'vue'
import api from '../../service/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../Store/auth'
const router = useRouter()
const email = ref('')
const password = ref('')
const auth = useAuthStore();

const handleLogin = async () => {
    try {
        const response = await api.post('/login', {
            email: email.value,
            password: password.value
        })
        console.log(response)
        auth.login(
            response.data.accessToken,
            response.data.data
        )

        alert('เข้าสู่ระบบสำเร็จ!')

        // redirect ตาม role
        const role = response.data.data.role
        if (role === 'STUDENT') router.push('/')
        else if (role === 'TEACHER') router.push('/')
        else router.push('/admin/dashboard')

    } catch (error) {
        alert('Login Failed: ' + (error.response?.data?.message || error.message))
    }
}
</script>


<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full p-8 bg-white shadow-lg rounded-xl">
            <h2 class="text-3xl font-bold text-center text-blue-600 mb-8">เข้าสู่ระบบการเรียน</h2>
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">อีเมล</label>
                    <input v-model="email" type="email"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                    <input v-model="password" type="password"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required />
                </div>
                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                    เข้าสู่ระบบ
                </button>
            </form>
            <p class="mt-4 text-center text-sm text-gray-600">
                ยังไม่มีบัญชี? <router-link to="/register" class="text-blue-500">สมัครสมาชิก</router-link>
            </p>
        </div>
    </div>
</template>