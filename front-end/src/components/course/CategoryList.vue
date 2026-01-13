<script setup>
defineProps({
    categories: {
        type: Array,
        default: () => []
    },
    selectedCategory: {
        type: [Number, null],
        default: null
    }
})

const emit = defineEmits(['update:selectedCategory'])
</script>

<template>
    <section class="max-w-6xl mx-auto px-6">
        <h2 class="text-2xl font-bold mb-6">📚 หมวดหมู่คอร์ส</h2>

        <div class="flex flex-wrap gap-4">
            <div class="flex flex-wrap gap-2 mb-6">
                <button
                    :class="{ 'bg-blue-600 text-white': selectedCategory === null, 'bg-gray-200 text-gray-700': selectedCategory !== null }"
                    class="px-4 py-2 rounded-full font-semibold" @click="$emit('update:selectedCategory', null)">
                    All
                </button>

                <button v-for="cat in categories" :key="cat.id"
                    :class="{ 'bg-blue-600 text-white': selectedCategory === cat.id, 'bg-gray-200 text-gray-700': selectedCategory !== cat.id }"
                    class="px-4 py-2 rounded-full font-semibold" @click="$emit('update:selectedCategory', cat.id)">
                    {{ cat.name }}
                </button>
            </div>
        </div>
    </section>
</template>
