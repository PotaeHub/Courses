<script setup>
import { useAuthStore } from '../../../Store/auth';

const auth = useAuthStore();

</script>
<template>
    <section class="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full">
            <div
                class="absolute top-10 left-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50">
            </div>
            <div
                class="absolute top-0 right-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50">
            </div>
        </div>

        <h1 class="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
            เรียนรู้ทักษะใหม่ <br>
            <span class="text-blue-600 underline decoration-blue-200">เพื่ออนาคตของคุณ</span>
        </h1>
        <p class="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            คลังคอร์สเรียนออนไลน์คุณภาพสูงจากผู้เชี่ยวชาญระดับประเทศ
            พร้อมระบบจัดการการเรียนที่ง่ายและทันสมัยที่สุด
        </p>
        <div v-if="!auth.token" class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <router-link to="/courses"
                class="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:scale-105 transition shadow-xl">
                สำรวจคอร์สเรียน
            </router-link>
            <router-link to="/register"
                class="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition">
                เริ่มสอนกับเรา
            </router-link>
        </div>
    </section>
</template>