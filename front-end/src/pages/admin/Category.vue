<script setup>
import { onMounted, ref } from 'vue';
import CategoryTable from '../../components/Admin/CategoryTable.vue';
import CategoryModal from '../../components/Admin/CategoryModal.vue';
import api from '../../service/api';
const categories = ref([]);
const fetchCategory = async () => {
    const res = await api.get("/admin/category");
    categories.value = res.data.category
}

const showModal = ref(false);
const selectedCategory = ref(null);

const openAddModal = () => {
    selectedCategory.value = null;
    showModal.value = true;
};

const openEditModal = (category) => {
    selectedCategory.value = { ...category };
    showModal.value = true;
};
onMounted(fetchCategory)
</script>

<template>
    <div class="p-8 max-w-6xl mx-auto">
        <div class="flex justify-between items-end mb-8">
            <div>
                <h1 class="text-3xl font-black text-gray-900 tracking-tight">Categories</h1>
                <p class="text-sm text-gray-500 mt-1">จัดการหมวดหมู่คอร์สเรียนทั้งหมดในระบบ</p>
            </div>
            <button @click="openAddModal"
                class="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 flex items-center gap-2 active:scale-95">
                <span>+ Create Category</span>
            </button>
        </div>

        <CategoryTable :categories="categories" @edit="openEditModal" @delete="(id) => console.log('Delete:', id)" />

        <CategoryModal :show="showModal" :category="selectedCategory" @close="showModal = false" />
    </div>
</template>