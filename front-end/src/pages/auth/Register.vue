<script setup>
import { reactive, computed } from 'vue'
import Swal from 'sweetalert2' // อย่าลืมติดตั้ง npm install sweetalert2
import api from '../../service/api.js'

const form = reactive({
    email: '', password: '', confirmPassword: '', name: '',
    role: 'STUDENT',
    subject: '', experience: null, phone: ''
})

const isPasswordMatch = computed(() => form.confirmPassword !== '' && form.password === form.confirmPassword)
const isFormValid = computed(() => {
    const common = form.email && form.password && form.name && isPasswordMatch.value;
    if (form.role === 'TEACHER') return common && form.subject && form.experience !== null;
    return common;
})

/* ================= HANDLE REGISTER WITH SWEETALERT2 ================= */
const handleRegister = async () => {
    try {
        if (!isPasswordMatch.value) {
            return Swal.fire({
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'กรุณาตรวจสอบการยืนยันรหัสผ่านอีกครั้ง',
                icon: 'error',
                confirmButtonColor: '#111827',
                customClass: { popup: 'rounded-[2rem]' }
            });
        }

        // แสดง Loading ขณะรอ API
        Swal.fire({
            title: 'กำลังสร้างบัญชี...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
            customClass: { popup: 'rounded-[2rem]' }
        });

        const { confirmPassword, ...submitData } = form;
        await api.post('/register', submitData);

        // แสดงผลสำเร็จ
        await Swal.fire({
            title: 'สมัครสมาชิกสำเร็จ!',
            text: 'ยินดีต้อนรับเข้าสู่ระบบ การลงทะเบียนของคุณเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonColor: '#10b981', // สี emerald-500
            confirmButtonText: 'เข้าสู่ระบบเลย',
            customClass: { popup: 'rounded-[2rem]' }
        });

        window.location.href = '/login';

    } catch (err) {
        // จัดการ Error จาก Server
        Swal.fire({
            title: 'สมัครสมาชิกไม่สำเร็จ',
            text: err.response?.data?.message || 'เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่ในภายหลัง',
            icon: 'error',
            confirmButtonColor: '#ef4444', // สีแดง
            customClass: { popup: 'rounded-[2rem]' }
        });
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-[#b8e3f7] py-12 px-4 antialiased">
        <div
            class="max-w-md w-full p-10 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">

            <h2 class="text-3xl font-semibold mb-2 text-center text-gray-900 tracking-tight">สร้างบัญชีใหม่</h2>
            <p class="text-center text-gray-400 text-sm mb-8 font-medium">เริ่มต้นเส้นทางการเรียนรู้ไปกับเรา</p>

            <div class="flex mb-8 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                <button @click="form.role = 'STUDENT'"
                    :class="form.role === 'STUDENT' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
                    class="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300">เป็นนักเรียน</button>
                <button @click="form.role = 'TEACHER'"
                    :class="form.role === 'TEACHER' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
                    class="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300">เป็นอาจารย์</button>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-5">
                <div class="space-y-4">
                    <input v-model="form.name" type="text" placeholder="ชื่อ-นามสกุล"
                        class="w-full bg-gray-50 border-transparent border px-5 py-3.5 rounded-2xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 outline-none transition-all placeholder:text-gray-400 text-sm"
                        required />

                    <input v-model="form.email" type="email" placeholder="อีเมล"
                        class="w-full bg-gray-50 border-transparent border px-5 py-3.5 rounded-2xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 outline-none transition-all placeholder:text-gray-400 text-sm"
                        required />

                    <div class="space-y-1.5">
                        <input v-model="form.password" type="password" placeholder="รหัสผ่าน (6 ตัวขึ้นไป)"
                            class="w-full bg-gray-50 border-transparent border px-5 py-3.5 rounded-2xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 outline-none transition-all placeholder:text-gray-400 text-sm"
                            required />
                    </div>

                    <div class="space-y-1.5">
                        <input v-model="form.confirmPassword" type="password" placeholder="ยืนยันรหัสผ่าน" :class="[
                            'w-full bg-gray-50 border px-5 py-3.5 rounded-2xl outline-none transition-all text-sm',
                            form.confirmPassword && !isPasswordMatch ? 'border-red-100 bg-red-50/30 text-red-600 focus:ring-red-50' : 'border-transparent focus:bg-white focus:border-gray-200 focus:ring-gray-50'
                        ]" required />

                        <div class="flex items-center gap-1.5 px-2">
                            <p v-if="form.confirmPassword && !isPasswordMatch"
                                class="text-red-500 text-[11px] font-medium animate-in fade-in slide-in-from-left-1">
                                ✕ รหัสผ่านไม่ตรงกัน
                            </p>
                            <p v-if="form.confirmPassword && isPasswordMatch"
                                class="text-emerald-500 text-[11px] font-medium animate-in fade-in slide-in-from-left-1">
                                ✓ รหัสผ่านตรงกัน
                            </p>
                        </div>
                    </div>

                    <input v-model="form.phone" type="text" placeholder="เบอร์โทรศัพท์ (ถ้ามี)"
                        class="w-full bg-gray-50 border-transparent border px-5 py-3.5 rounded-2xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 outline-none transition-all placeholder:text-gray-400 text-sm" />
                </div>

                <div v-if="form.role === 'TEACHER'"
                    class="space-y-4 pt-4 border-t border-gray-50 animate-in fade-in duration-500">
                    <p class="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.15em] ml-1">Teacher
                        Information</p>
                    <input v-model="form.subject" type="text" placeholder="วิชาที่สอน"
                        class="w-full bg-emerald-50/30 border-emerald-50 border px-5 py-3.5 rounded-2xl focus:bg-white focus:border-emerald-100 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all placeholder:text-emerald-400 text-sm"
                        required />
                    <input v-model="form.experience" type="number" placeholder="ประสบการณ์ (ปี)"
                        class="w-full bg-emerald-50/30 border-emerald-50 border px-5 py-3.5 rounded-2xl focus:bg-white focus:border-emerald-100 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all placeholder:text-emerald-400 text-sm" />
                </div>

                <button type="submit" :disabled="!isFormValid"
                    :class="isFormValid ? 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                    class="w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-300 transform active:scale-[0.98] mt-4">
                    ลงทะเบียนเป็น {{ form.role === 'STUDENT' ? 'นักเรียน' : 'อาจารย์' }}
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.animate-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>