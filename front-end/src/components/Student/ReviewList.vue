<template>
    <div class="mt-8">
        <h2 class="text-xl font-bold mb-4">Reviews</h2>

        <div v-if="reviews.length > 0" class="space-y-4">
            <div v-for="review in reviews" :key="review.id" class="p-4 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold">{{ review.user.name }}</span>
                    <span class="text-yellow-500 font-bold">{{ review.rating }}/5</span>
                </div>
                <p class="text-gray-600">{{ review.comment }}</p>
            </div>
        </div>

        <div v-else class="text-gray-400">No reviews yet.</div>
    </div>
</template>

<script setup>
defineProps({
    reviews: Array
})
</script>
