<script setup>
import { MoreHorizontal } from 'lucide-vue-next'

defineProps({
    activities: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
        <div class="flex justify-between items-center mb-8">
            <h3 class="text-lg font-black text-slate-800 tracking-tight">Recent Students</h3>
            <button class="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">View
                All</button>
        </div>

        <div class="space-y-6">
            <div v-for="(item, index) in activities" :key="index"
                class="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-all duration-300">
                <div class="relative flex-shrink-0">
                    <div
                        class="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-400 group-hover:scale-110 transition-transform duration-300">
                        {{ item.name.charAt(0) }}
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                        :class="item.online ? 'bg-emerald-500' : 'bg-slate-300'"></div>
                </div>

                <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-slate-800 truncate leading-none mb-1">{{ item.name }}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{{ item.course }}</p>
                </div>

                <div class="text-right flex flex-col items-end gap-1">
                    <span class="text-[10px] font-black text-slate-300 uppercase">{{ item.time }}</span>
                    <button class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal :size="16" class="text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>