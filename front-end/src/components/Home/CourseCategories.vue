<script setup>

</script>
<template>
    <section class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex justify-between items-end mb-12">
            <div>
                <h2 class="text-3xl font-bold text-gray-900">หมวดหมู่ยอดนิยม</h2>
                <p class="text-gray-500 mt-2">เลือกเรียนตามความสนใจของคุณ</p>
            </div>
            <router-link to="/courses" class="text-blue-600 font-bold hover:underline">ดูทั้งหมด →</router-link>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div v-for="cat in ['Programming', 'Design', 'Business', 'Marketing']" :key="cat"
                class="p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-2 transition duration-300 border border-transparent hover:border-blue-100 cursor-pointer text-center">
                <div class="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4"></div>
                <h4 class="font-bold text-gray-800">{{ cat }}</h4>
            </div>
        </div>
    </section>
</template>