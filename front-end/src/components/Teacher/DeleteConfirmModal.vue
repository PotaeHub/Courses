<script setup>
import { ref } from 'vue'
import { Trash2, AlertCircle, X } from 'lucide-vue-next'

const props = defineProps({
    courseTitle: { type: String, default: 'this course' },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'close'])
</script>

<template>
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            @click="!loading && emit('close')"></div>

        <div
            class="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300">

            <button @click="emit('close')"
                class="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                :disabled="loading">
                <X :size="20" />
            </button>

            <div class="p-10 text-center">
                <div
                    class="mx-auto w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6 animate-bounce-short">
                    <Trash2 :size="40" class="text-red-500" stroke-width="2.5" />
                </div>

                <h3 class="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                    Confirm Deletion
                </h3>
                <p class="text-slate-500 font-medium leading-relaxed">
                    คุณแน่ใจหรือไม่ว่าต้องการลบคอร์ส <br />
                    <span class="text-red-500 font-black">"{{ courseTitle }}"</span> ? <br />
                    <span
                        class="text-xs uppercase tracking-widest text-slate-400 mt-4 block">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
                </p>

                <div class="grid grid-cols-2 gap-4 mt-10">
                    <button @click="emit('close')"
                        class="px-6 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                        :disabled="loading">
                        Cancel
                    </button>
                    <button @click="emit('confirm')"
                        class="relative px-6 py-4 rounded-2xl font-black text-white bg-red-500 shadow-lg shadow-red-200 hover:bg-red-600 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 flex items-center justify-center overflow-hidden"
                        :disabled="loading">
                        <span v-if="!loading">Delete Now</span>
                        <div v-else class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin">
                        </div>
                    </button>
                </div>
            </div>

            <div class="bg-red-50/50 p-4 flex items-center justify-center gap-2">
                <AlertCircle :size="14" class="text-red-400" />
                <span class="text-[10px] font-black uppercase tracking-tighter text-red-400">
                    Warning: All student progress in this course will be lost
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes bounce-short {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

.animate-bounce-short {
    animation: bounce-short 2s ease-in-out infinite;
}
</style>