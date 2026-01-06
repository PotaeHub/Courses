<script setup>
import { Mail, MessageSquare, MoreVertical, Calendar, BookOpen } from 'lucide-vue-next'

defineProps({
    student: Object
})

const getStatusBadge = (progress) => {
    if (progress >= 100) return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    if (progress > 0) return 'bg-blue-50 text-blue-600 border-blue-100'
    return 'bg-slate-50 text-slate-500 border-slate-100'
}
</script>

<template>
    <div
        class="group bg-white rounded-[2rem] p-6 border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col gap-6">
        <div class="flex justify-between items-start">
            <div class="flex items-center gap-4">
                <div
                    class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-400 text-xl group-hover:scale-110 transition-transform">
                    {{ student.name.charAt(0) }}
                </div>
                <div>
                    <h3 class="font-black text-slate-800 leading-none mb-1 group-hover:text-blue-600 transition-colors">
                        {{ student.name }}</h3>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">{{ student.email }}</p>
                </div>
            </div>
            <button class="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <MoreVertical :size="20" />
            </button>
        </div>

        <div class="space-y-4">
            <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-50">
                <div class="flex items-center gap-2 mb-3">
                    <BookOpen :size="14" class="text-blue-500" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Enrolled Course</span>
                </div>
                <p class="text-sm font-black text-slate-700 leading-tight">{{ student.courseName }}</p>
            </div>

            <div class="space-y-2">
                <div class="flex justify-between items-end">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning
                        Progress</span>
                    <span class="text-sm font-black text-slate-800">{{ student.progress }}%</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                        :style="{ width: `${student.progress}%` }"></div>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-slate-50">
            <div class="flex items-center gap-1.5 text-slate-400">
                <Calendar :size="14" />
                <span class="text-[10px] font-bold uppercase tracking-tighter">{{ student.joinedDate }}</span>
            </div>
            <div class="flex gap-2">
                <button
                    class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                    <Mail :size="18" />
                </button>
                <button
                    class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                    <MessageSquare :size="18" />
                </button>
            </div>
        </div>
    </div>
</template>