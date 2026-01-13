<script setup>
import { useRouter } from 'vue-router'

defineProps({
    course: Object
})

const router = useRouter()

const goToCourse = () => {
    router.push(`/student/courses/${course.courseId}`)
}
</script>

<template>
    <div class="bg-white rounded-xl overflow-hidden shadow-sm
           hover:shadow-lg hover:-translate-y-1 transition cursor-pointer" @click="goToCourse">
        <img :src="course.image || '/placeholder.png'" class="h-40 w-full object-cover" />

        <div class="p-4">
            <h3 class="font-semibold mb-2">{{ course.title }}</h3>

            <!-- Progress -->
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: course.progress + '%' }" />
            </div>

            <p class="text-xs text-gray-500">
                Progress {{ course.progress }}%
            </p>
        </div>
    </div>
</template>
