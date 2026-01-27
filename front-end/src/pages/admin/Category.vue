<script setup>
import { onMounted, ref } from 'vue';
import CategoryTable from '../../components/Admin/CategoryTable.vue';
import CategoryModal from '../../components/Admin/CategoryModal.vue';
import api from '../../service/api';
const categories = ref([]);
const showDeleteModal = ref(false);
const deleteCategoryId = ref(null);

const openDeleteModal = (id) => {
    deleteCategoryId.value = id;
    showDeleteModal.value = true;
};

const confirmDeleteCategory = async () => {
    try {
        await api.delete(`/admin/category/${deleteCategoryId.value}`);
        await fetchCategory();
        showDeleteModal.value = false;
        deleteCategoryId.value = null;
    } catch (err) {
        console.error(err);
        alert("ไม่สามารถลบหมวดหมู่ได้ (อาจมีคอร์สใช้งานอยู่)");
    }
};

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
    <div class="p-8 max-w-6xl mx-auto min-h-screen bg-[#FAFAFA] antialiased">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
                <h1 class="text-3xl font-semibold text-gray-900 tracking-tight">Categories</h1>
                <p class="text-sm text-gray-500 mt-1">Course Management System</p>
            </div>
            
            <button @click="openAddModal"
                class="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium text-sm 
                       hover:bg-black transition-all active:scale-95 
                       shadow-sm flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>CREATE CATEGORY</span>
            </button>
        </div>

        <div class="bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm transition-shadow hover:shadow-md">
            <CategoryTable 
                :categories="categories" 
                @edit="openEditModal" 
                @delete="openDeleteModal"
                class="w-full"
            />
        </div>

        <CategoryModal 
            :show="showModal" 
            :category="selectedCategory" 
            @close="showModal = false" 
            @saved="fetchCategory" 
        />

        <p class="text-center text-[10px] text-gray-400 font-semibold mt-10 uppercase tracking-[0.15em]">
            Manage your content structure efficiently
        </p>

        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
            <div class="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-50 animate-in fade-in zoom-in duration-200">
                <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-5">
                    <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold mb-2 text-gray-900">ลบหมวดหมู่นี้?</h3>
                <p class="text-sm text-gray-500 mb-8 leading-relaxed">
                    คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้? ข้อมูลที่ถูกลบไปแล้วจะไม่สามารถกู้คืนกลับมาได้
                </p>

                <div class="grid grid-cols-2 gap-3">
                    <button @click="closeDeleteModal"
                        class="px-5 py-2.5 rounded-xl border border-gray-100 font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        ยกเลิก
                    </button>
                    <button @click="confirmDeleteCategory"
                        class="px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-100">
                        ยืนยันการลบ
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>