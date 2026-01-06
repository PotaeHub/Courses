<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../Store/auth.js'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
    auth.logout()
    router.push('/login')
}
</script>

<template>
    <nav
        class="bg-white border-b border-gray-100 shadow-sm px-4 h-16 flex items-center justify-between sticky top-0 z-50">

        <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span class="text-xl font-bold text-gray-800">COURSEHUB</span>
        </router-link>

        <div v-if="auth.user" class="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
            <!-- คอร์สทั้งหมด (ทุก role) -->
            <router-link to="/courses" class="hover:text-blue-600">
                คอร์สทั้งหมด
            </router-link>

            <!-- นักเรียน -->
            <router-link v-if="auth.user.role === 'STUDENT'" to="/my-learning" class="hover:text-blue-600">
                คอร์สของฉัน
            </router-link>

            <!-- ครู -->
            <template v-if="auth.user.role === 'TEACHER'">
                <router-link to="/teacher/dashboard" class="hover:text-blue-600">
                    Dashboard
                </router-link>

                <router-link to="/teacher/courses" class="hover:text-blue-600">
                    คอร์สที่ฉันสอน
                </router-link>

                <router-link to="/teacher/students" class="hover:text-blue-600">
                    นักเรียน
                </router-link>

                <router-link to="/teacher/earnings" class="hover:text-blue-600">
                    รายได้
                </router-link>

                <router-link to="/teacher/profile" class="hover:text-blue-600">
                    โปรไฟล์
                </router-link>
            </template>

            <!-- Admin -->
            <router-link v-if="auth.user.role === 'ADMIN'" to="/admin/dashboard" class="text-red-600 font-bold">
                Admin
            </router-link>
        </div>



        <div v-if="!auth.token" class="flex items-center space-x-3">
            <router-link to="/login" class="text-sm text-gray-600 px-4 py-2">
                เข้าสู่ระบบ
            </router-link>
            <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                สมัครสมาชิก
            </router-link>
        </div>


        <div v-else class="flex items-center space-x-3">
            <span class="text-sm text-gray-700">
                {{ auth.user?.email }}
            </span>
            <button @click="handleLogout" class="text-sm font-medium text-red-500 px-4 py-2">
                ออกจากระบบ
            </button>
        </div>

    </nav>
</template>
