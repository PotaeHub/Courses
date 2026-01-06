<script setup>
import { Search, Filter, Download, Users } from 'lucide-vue-next'

defineProps({
    totalStudents: Number
})

defineEmits(['update:search'])
</script>

<template>
    <div class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                        <Users :size="24" stroke-width="2.5" />
                    </div>
                    <h1 class="text-3xl font-black text-slate-900 tracking-tighter uppercase">Students Enrollment</h1>
                </div>
                <p class="text-slate-500 font-medium">จัดการและติดตามรายชื่อนักเรียนที่ลงทะเบียนคอร์สของคุณทั้งหมด ({{
                    totalStudents }} คน)</p>
            </div>

            <div class="flex gap-3">
                <button
                    class="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    Export List
                </button>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
            <div class="relative flex-1 group">
                <Search
                    class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                    :size="20" />
                <input type="text" placeholder="Search by name, email or course name..."
                    class="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-50 shadow-sm font-bold text-sm transition-all"
                    @input="$emit('update:search', $event.target.value)" />
            </div>
            <button
                class="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-slate-400 hover:text-blue-600 transition-all flex items-center gap-3 shadow-sm font-black text-xs uppercase tracking-widest">
                <Filter :size="18" /> Filter By Course
            </button>
        </div>
    </div>
</template>