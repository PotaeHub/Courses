<script setup>
import { ref } from 'vue'
import api from '../../service/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../Store/auth'
import Swal from 'sweetalert2' // นำเข้า SweetAlert2

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

        auth.login(
            response.data.accessToken,
            response.data.data
        )

        // แจ้งเตือนเมื่อสำเร็จ
        await Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ!',
            text: 'ยินดีต้อนรับเข้าสู่ระบบการเรียน',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
                popup: 'rounded-[2rem]' // ปรับความมนให้เข้ากับดีไซน์หน้า Login
            }
        })

        // redirect ตาม role
        const role = response.data.data.role
        if (role === 'STUDENT') router.push('/')
        else if (role === 'TEACHER') router.push('/')
        else router.push('/admin/dashboard')

    } catch (error) {
        // แจ้งเตือนเมื่อเกิดข้อผิดพลาด
        Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
            confirmButtonColor: '#111827', // สีเทาเข้ม/ดำ ตามธีมปุ่ม
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl px-6 py-2'
            }
        })
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-[#b8e3f7] antialiased">
        <div class="max-w-md w-full p-10 bg-white border border-gray-100 rounded-[2rem] shadow-sm">

            <div class="mb-10">
                <h2 class="text-2xl font-semibold text-center text-gray-900 tracking-tight">เข้าสู่ระบบการเรียน</h2>
                <p class="text-center text-gray-400 text-sm mt-2">ยินดีต้อนรับกลับมา เริ่มต้นการเรียนรู้อีกครั้ง</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">อีเมล</label>
                    <input v-model="email" type="email" class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl 
                               focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 
                               outline-none transition-all duration-200 placeholder:text-gray-300"
                        placeholder="your@email.com" required />
                </div>

                <div class="space-y-1.5">
                    <div class="flex justify-between items-center ml-1">
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">รหัสผ่าน</label>
                    </div>
                    <input v-model="password" type="password" class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl 
                               focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 
                               outline-none transition-all duration-200 placeholder:text-gray-300"
                        placeholder="••••••••" required />
                </div>

                <button type="submit" class="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-medium 
                           hover:bg-black transition-all active:scale-[0.98] shadow-sm shadow-gray-200">
                    เข้าสู่ระบบ
                </button>
            </form>

            <div class="mt-8 text-center">
                <p class="text-sm text-gray-500">
                    ยังไม่มีบัญชีใช่ไหม?
                    <router-link to="/register"
                        class="text-gray-900 font-semibold hover:underline decoration-gray-300 underline-offset-4 ml-1">
                        สมัครสมาชิกฟรี
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* คุณสามารถเพิ่ม CSS เพิ่มเติมได้ที่นี่หากต้องการปรับแต่ง SweetAlert เพิ่ม */
</style>