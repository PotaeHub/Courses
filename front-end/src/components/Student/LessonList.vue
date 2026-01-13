<template>
    <div class="space-y-4">
        <h2 class="text-xl font-bold mb-4">Lessons</h2>
        <ul class="space-y-2">
            <li v-for="lesson in lessons" :key="lesson.id">
                <button @click="$emit('select-lesson', lesson)"
                    class="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex justify-between items-center">
                    <span>{{ lesson.sortOrder }}. {{ lesson.title }}</span>
                    <span class="text-gray-400 text-sm">{{ lesson.videos.length }} videos</span>
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup>
defineProps({
    lessons: Array
})
</script>
