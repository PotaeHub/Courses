<script setup>
import { Users, Star, ArrowUpRight, Clock } from 'lucide-vue-next'

defineProps({
    name: String,
    students: [Number, String],
    rating: [Number, String],
    status: String,
    image: String,
    lastUpdated: String
})
</script>

<template>
    <div
        class="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col h-full">
        <div class="relative h-48 overflow-hidden">
            <img :src="image" :alt="name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div
                class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>

            <div
                class="absolute top-5 right-5 backdrop-blur-md bg-white/80 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
                {{ status }}
            </div>
        </div>

        <div class="p-7 flex flex-col flex-1">
            <div class="flex-1">
                <h3
                    class="font-black text-slate-800 text-lg leading-snug group-hover:text-blue-600 transition-colors duration-300">
                    {{ name }}
                </h3>
                <div class="flex items-center gap-2 mt-2 text-slate-400">
                    <Clock :size="12" />
                    <span class="text-[10px] font-bold uppercase tracking-tighter">Updated {{ lastUpdated }}</span>
                </div>
            </div>

            <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                <div class="flex items-center gap-5">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Students</span>
                        <div class="flex items-center gap-1 text-slate-800 font-black">
                            <Users :size="14" class="text-blue-500" /> {{ students }}
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rating</span>
                        <div class="flex items-center gap-1 text-slate-800 font-black">
                            <Star :size="14" class="text-orange-400 fill-orange-400" /> {{ rating }}
                        </div>
                    </div>
                </div>

                <button
                    class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <ArrowUpRight :size="20" stroke-width="2.5" />
                </button>
            </div>
        </div>
    </div>
</template>