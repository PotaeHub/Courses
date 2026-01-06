<script setup>
import { reactive, watch } from 'vue'

const emit = defineEmits(['filter-change'])

const filters = reactive({
    search: '',
    role: '',
    sortBy: 'createdAt'
})

// ใช้ watch เพื่อส่งค่ากลับไปที่ Parent ทันทีที่มีการเปลี่ยนแปลงข้อมูลใน Filter
watch(filters, (newVal) => {
    emit('filter-change', { ...newVal })
})
</script>

<template>
    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div class="flex flex-col md:flex-row gap-4 items-center">

            <div class="relative flex-1 w-full">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input v-model="filters.search" type="text" placeholder="ค้นหาชื่อหรืออีเมล..."
                    class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg outline-none transition-all text-sm" />
            </div>

            <div class="w-full md:w-48">
                <select v-model="filters.role"
                    class="w-full px-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg outline-none text-sm transition-all">
                    <option value="">ทั้งหมด</option>
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <div class="w-full md:w-48">
                <select v-model="filters.sortBy"
                    class="w-full px-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg outline-none text-sm transition-all">
                    <option value="createdAt">เรียงตามวันที่สมัคร</option>
                    <option value="name">เรียงตามชื่อ</option>
                    <option value="email">เรียงตามอีเมล</option>
                </select>
            </div>

            <button @click="Object.assign(filters, { search: '', role: '', sortBy: 'createdAt' })"
                class="text-sm text-gray-500 hover:text-red-500 font-medium transition">
                ล้างค่า
            </button>

        </div>
    </div>
</template>