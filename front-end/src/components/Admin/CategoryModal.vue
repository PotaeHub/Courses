<script setup>
import BaseModal from '../BaseModal.vue';
import { reactive, watch } from 'vue';

const props = defineProps({ show: Boolean, category: Object });
const emit = defineEmits(['close', 'save']);

const form = reactive({ name: '', slug: '', icon: '📁' });

watch(() => props.category, (val) => {
    if (val) Object.assign(form, val);
    else Object.assign(form, { name: '', slug: '', icon: '📁' });
});
</script>

<template>
    <BaseModal :show="show" :title="category ? 'Edit Category' : 'Create Category'" @close="emit('close')">
        <div class="space-y-6">
            <div class="flex gap-4">
                <div class="flex-1">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category
                        Name</label>
                    <input v-model="form.name" type="text" placeholder="e.g. Marketing"
                        class="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" />
                </div>
                <div class="w-24">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icon</label>
                    <input v-model="form.icon" type="text"
                        class="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl text-center focus:ring-2 focus:ring-blue-500 outline-none text-lg" />
                </div>
            </div>

            <div>
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Slug (URL
                    friendly)</label>
                <div class="flex items-center bg-gray-50 rounded-2xl mt-1 px-4 py-3">
                    <span class="text-gray-300 text-sm font-mono mr-1">/</span>
                    <input v-model="form.slug" type="text" placeholder="marketing-strategy"
                        class="w-full bg-transparent border-none outline-none text-sm font-mono text-blue-600" />
                </div>
            </div>

            <div class="flex gap-3 pt-4">
                <button @click="emit('close')"
                    class="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-all">
                    Cancel
                </button>
                <button
                    class="flex-[2] py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm shadow-xl hover:bg-blue-600 transition-all active:scale-95">
                    Save Category
                </button>
            </div>
        </div>
    </BaseModal>
</template>