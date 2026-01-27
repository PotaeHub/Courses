<script setup>
import { ref, watch, computed } from 'vue'
import api from '../../service/api'

const props = defineProps({
  show: Boolean,
  category: Object
})

const emit = defineEmits(['close', 'saved'])

const name = ref('')
const loading = ref(false)
const error = ref('')

// mode
const isEdit = computed(() => !!props.category)

// sync when open
watch(
  () => props.category,
  (val) => {
    name.value = val?.name || ''
    error.value = ''
  },
  { immediate: true }
)

const close = () => {
  emit('close')
  name.value = ''
  error.value = ''
}

// save
const saveCategory = async (e) => {
    if (!name.value.trim()) {
    error.value = 'กรุณากรอกชื่อหมวดหมู่'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (isEdit.value) {
      // UPDATE
      await api.put(`/admin/category/${props.category.id}`, {
        name: name.value
      })
    } else {
      // CREATE
      await api.post('/admin/category', {
        name: name.value
      })
    }

    emit('saved')
    close()
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white w-full max-w-md rounded-[2rem] border-2 border-black p-8 shadow-xl">

      <h2 class="text-2xl font-black mb-6">
        {{ isEdit ? 'Edit Category' : 'Create Category' }}
      </h2>

      <div class="mb-4">
        <label class="block text-sm font-bold mb-2">Category name</label>
        <input
          v-model="name"
          type="text"
          placeholder="Enter category name..."
          class="w-full border-2 border-black rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600 font-bold mb-4">{{ error }}</p>

      <div class="flex justify-end gap-3 mt-8">
        <button
          @click="close"
          class="px-6 py-2 rounded-xl border-2 border-black font-bold hover:bg-gray-100"
          :disabled="loading"
        >
          Cancel
        </button>

        <button
          @click="saveCategory"
          class="px-6 py-2 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
        </button>
      </div>

    </div>
  </div>
</template>
