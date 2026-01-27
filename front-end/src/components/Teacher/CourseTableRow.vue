<script setup>
import { Edit3, BarChart2, Trash2, Users, Star, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps({
    course: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['view', 'edit', 'delete'])


const getCourseImage = (image) => {
    if (!image) return null
    return import.meta.env.VITE_BACKEND_URL + image
}

const getStatusClass = (status = '') => {
    switch (status.toUpperCase()) {
        case 'PUBLISHED':
            return 'bg-green-100 text-green-700 border border-green-200'

        case 'DRAFT':
            return 'bg-blue-50 text-blue-700 border border-blue-100'

        case 'ARCHIVED':
            return 'bg-gray-100 text-gray-600 border border-gray-200'

        default:
            return 'bg-slate-50 text-slate-500 border border-slate-100'
    }
}

</script>

<template>
    <tr class="group hover:bg-slate-50/50 transition-all duration-300">
        <td class="px-8 py-5">
            <div class="flex items-center gap-4">
                <div class="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                    <img v-if="getCourseImage(course.image)" :src="getCourseImage(course.image)"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div v-else
                        class="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                        NO IMAGE
                    </div>
                </div>
                <div class="min-w-0">
                    <p
                        class="font-black text-slate-800 leading-tight truncate group-hover:text-blue-600 transition-colors">
                        {{ course.name }}
                    </p>
                    <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">ID: #{{
                        course.id }}
                    </p>
                </div>
            </div>
        </td>

        <td class="px-6 py-5">
            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-slate-600">
                    <Users :size="14" class="text-slate-300" />
                    <span class="text-sm font-black">{{ course.students.toLocaleString() }}</span>
                </div>
                <div class="flex items-center gap-2 text-orange-400 font-bold">
                    <Star :size="14" class="fill-orange-400" />
                    <span class="text-xs">{{ course.rating || 'New' }}</span>
                </div>
            </div>
        </td>

        <td class="px-6 py-5">
            <p class="text-sm font-black text-slate-800 tracking-tight">{{ course.sales.toLocaleString() }} คน</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue</p>
        </td>

        <td class="px-6 py-5">
            <div class="flex justify-center">
                <span
                    class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors"
                    :class="getStatusClass(course.status)">
                    {{ course.status }}
                </span>
            </div>
        </td>

        <td class="px-8 py-5 text-right">
            <div class="flex items-center justify-end gap-1">
                <button class="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit">
                    <Edit3 :size="18" />
                </button>
                <button
                    class="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Analytics" @click="emit('edit', course)">
                    <BarChart2 :size="18" />
                </button>
                <button class="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete" @click="emit('delete', course)">
                    <Trash2 :size="18" />
                </button>
            </div>
        </td>
    </tr>
</template>