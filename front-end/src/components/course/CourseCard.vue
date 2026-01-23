<script setup>
defineProps({
    course: {
        type: Object,
        required: true
    }
})

const BASE_URL = import.meta.env.VITE_BACKEND_URL
</script>

<template>
    <router-link :to="{ name: 'student-course-detail', params: { id: course.id } }" class="group block">

        <div
            class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-[380px] flex flex-col">

            <!-- IMAGE -->
            <div class="relative h-[200px] bg-gray-100">
                <img v-if="course.image" :src="`${BASE_URL}${course.image}`"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    ไม่มีรูปภาพ
                </div>

                <!-- Rating Badge -->
                <div v-if="course.rating"
                    class="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                    ⭐ {{ course.rating }}
                </div>
            </div>

            <!-- CONTENT -->
            <div class="flex flex-col flex-1 p-4">
                <h3 class="font-bold text-gray-900 leading-snug line-clamp-2 mb-2 min-h-[44px]">
                    {{ course.title }}
                </h3>

                <!-- TEACHER -->
                <div class="flex items-center gap-2 mb-3">
                    <img v-if="course.teacher?.image" :src="`${BASE_URL}${course.teacher.image}`"
                        class="w-6 h-6 rounded-full object-cover" />

                    <div v-else
                        class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {{ course.teacher?.name?.charAt(0) }}
                    </div>

                    <span class="text-xs text-gray-500 truncate">
                        {{ course.teacher?.name || 'ผู้สอน' }}
                    </span>
                </div>

                <!-- PRICE -->
                <div class="mt-auto flex items-center justify-between pt-3 border-t">
                    <span class="text-lg font-extrabold text-slate-900">
                        ฿{{ course.price.toLocaleString() }}
                    </span>

                    <span
                        class="bg-slate-900 group-hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition">
                        ดูรายละเอียด
                    </span>
                </div>
            </div>
        </div>
    </router-link>
</template>
