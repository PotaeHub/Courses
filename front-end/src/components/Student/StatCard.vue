<script setup>
defineProps({
    title: String,
    value: [String, Number]
})
</script>

<template>
    <div class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4
           hover:shadow-md transition">
        <div class="w-12 h-12 flex items-center justify-center rounded-lg
             bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <slot />
        </div>

        <div>
            <p class="text-sm text-gray-500">{{ title }}</p>
            <p class="text-xl font-bold">{{ value }}</p>
        </div>
    </div>
</template>
