<script setup>
import { onMounted, onUnmounted } from 'vue'
import { X, BookOpen, Clock, Tag, CreditCard } from 'lucide-vue-next'

defineProps({
    course: Object
})

const emit = defineEmits(['close'])

const closeOnEsc = (e) => {
    if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', closeOnEsc))
onUnmounted(() => window.removeEventListener('keydown', closeOnEsc))

// ฟังก์ชันช่วยสร้าง URL รูปและวิดีโอ
const getFileUrl = (file) => {
    if (!file) return null
    return `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')}/${file.replace(/^\/+/, '')}`
}
const getLessonVideoPreview = (lesson) => {
    if (lesson.videoFile) return URL.createObjectURL(lesson.videoFile)
    if (lesson.videoUrl) return getFileUrl(lesson.videoUrl)
    return null
}
</script>

<template>
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click="$emit('close')">

        <div class="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]"
            @click.stop>

            <div class="relative h-64 flex-shrink-0">
                <img v-if="course?.image" :src="getFileUrl(course.image)" alt="Course Image"
                    class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    No Image
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <button @click="$emit('close')"
                    class="absolute top-6 right-6 p-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all">
                    <X :size="20" />
                </button>

                <div class="absolute bottom-8 left-8 right-8 text-white">
                    <span
                        class="px-3 py-1 bg-blue-500/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                        {{ course?.type }}
                    </span>
                    <h2 class="text-3xl font-black mt-2 leading-tight">{{ course?.title }}</h2>
                </div>
            </div>


            <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-8">


                    <div class="md:col-span-7 space-y-6">
                        <div>
                            <h3
                                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <BookOpen :size="14" /> คำอธิบายคอร์ส
                            </h3>
                            <p class="text-slate-600 leading-relaxed font-medium">
                                {{ course?.description || 'ไม่มีคำอธิบายสำหรับคอร์สนี้' }}
                            </p>
                        </div>

                        <div>
                            <h3
                                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Clock :size="14" /> บทเรียนทั้งหมด ({{ course?.lessons?.length || 0 }})
                            </h3>

                            <div v-if="course?.lessons?.length" class="space-y-3">
                                <div v-for="lesson in course.lessons" :key="lesson.id"
                                    class="group flex flex-col gap-2 p-4 rounded-[24px] bg-slate-50 border border-slate-50 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300">


                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm font-black text-sm">
                                            {{ lesson.sortOrder }}
                                        </div>
                                        <p class="font-bold text-slate-800">{{ lesson.title }}</p>
                                    </div>


                                    <p class="text-xs text-slate-400">{{ lesson.content || '-' }}</p>


                                    <!-- Lesson Video -->
                                    <video v-if="getLessonVideoPreview(lesson)" :src="getLessonVideoPreview(lesson)"
                                        controls class="w-full max-h-60 rounded-xl mt-2 bg-black" />
                                    <div v-else class="text-gray-400 italic text-xs mt-2">No video available</div>
                                </div>
                            </div>

                            <div v-else
                                class="py-8 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                                <p class="text-slate-400 text-sm font-medium italic tracking-wide">
                                    ยังไม่มีบทเรียนถูกเพิ่มเข้ามา</p>
                            </div>
                        </div>
                    </div>


                    <div class="md:col-span-5">
                        <div class="sticky top-0 space-y-4">
                            <div class="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-200">
                                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total
                                    Investment</p>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-3xl font-black">฿{{ course?.price?.toLocaleString() }}</span>
                                    <span class="text-slate-400 text-xs font-medium">/ คอร์ส</span>
                                </div>
                            </div>

                            <div class="bg-white border border-slate-100 rounded-[32px] p-6 space-y-4 shadow-sm">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-blue-50 rounded-xl text-blue-500">
                                            <Tag :size="18" />
                                        </div>
                                        <span class="text-sm font-bold text-slate-600">ประเภท</span>
                                    </div>
                                    <span class="text-sm font-black text-slate-800">{{ course?.type }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                                            <CreditCard :size="18" />
                                        </div>
                                        <span class="text-sm font-bold text-slate-600">การชำระเงิน</span>
                                    </div>
                                    <span class="text-sm font-black text-slate-800">ครั้งเดียว</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="p-8 border-t border-slate-50 bg-white flex justify-end">
                <button @click="$emit('close')"
                    class="px-10 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-sm hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-95">
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-scaleIn {
    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

video {
    border-radius: 1rem;
    object-fit: cover;
}
</style>
