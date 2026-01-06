<script setup>
defineProps({
    show: Boolean,
    title: String
})

const emit = defineEmits(['close'])
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/40" @click="emit('close')"></div>

        <!-- modal -->
        <div class="relative bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 z-10">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold">{{ title }}</h2>
                <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <slot />
        </div>
    </div>
</template>
