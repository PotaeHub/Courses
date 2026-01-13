<template>
    <div class="space-y-4">
        <h2 class="text-xl font-bold mb-4">Video</h2>

        <div v-if="video" class="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video controls :src="video.url" class="w-full h-full"></video>
        </div>

        <div v-else class="p-10 bg-gray-100 text-gray-400 rounded-lg text-center">
            Select a lesson video to play
        </div>

        <div v-if="lesson">
            <h3 class="font-semibold">{{ lesson.title }} - Videos</h3>
            <ul class="space-y-1">
                <li v-for="v in lesson.videos" :key="v.id">
                    <button @click="$emit('select-video', v)" class="w-full text-left p-2 hover:bg-gray-200 rounded-lg"
                        :class="v.id === video?.id ? 'bg-blue-100' : ''">
                        {{ v.url.split('/').pop() }}
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
defineProps({
    lesson: Object,
    video: Object
})
</script>
