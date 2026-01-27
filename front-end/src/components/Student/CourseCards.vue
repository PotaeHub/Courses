<template>
    <div class="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden group cursor-pointer"
        @click="goDetail">
        <!-- IMAGE -->
        <div class="relative h-44 overflow-hidden">
            <img :src="BASE_URL + imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition" />
            <span v-if="course.category"
                class="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                {{ course.category.name }}
            </span>
        </div>

        <!-- CONTENT -->
        <div class="p-5 space-y-3">
            <h3 class="text-lg font-bold text-gray-900 line-clamp-2">
                {{ course.title }}
            </h3>

            <p class="text-sm text-gray-500 line-clamp-2">
                {{ course.description }}
            </p>

            <div class="flex items-center justify-between pt-2">
                <div class="flex items-center gap-2">
                    <img v-if="course.teacher?.image" :src="`${BASE_URL}${course.teacher.image}`"
                        class="w-8 h-8 rounded-full object-cover" />
                    <span class="text-sm text-gray-600">
                        {{ course.teacher?.name || 'Teacher' }}
                    </span>
                </div>

                <span class="text-indigo-600 font-bold">
                    ฿{{ course.price.toLocaleString() }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const router = useRouter()

const props = defineProps({
    course: {
        type: Object,
        required: true
    }
})

const imageUrl = props.course.image

const goDetail = () => {
    router.push(`/student/course/${props.course.id}`)
}
</script>
