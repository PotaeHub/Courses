<script setup>
import api from '../../service/api'

const props = defineProps({
    course: Object
})

const emit = defineEmits(['close', 'deleted'])

const confirmDelete = async () => {
    try {
        await api.delete(`/admin/courses/${props.course.id}`)
        emit('deleted')
        emit('close')
    } catch (err) {
        console.error(err)
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-3xl p-6 w-[360px] space-y-4">
            <h3 class="text-lg font-black text-red-600">Delete Course</h3>

            <p class="text-sm text-gray-500">
                คุณแน่ใจหรือไม่ว่าต้องการลบ
                <span class="font-bold">{{ course.title }}</span> ?
            </p>

            <div class="flex justify-end gap-2 pt-4">
                <button @click="$emit('close')" class="px-4 py-2 rounded-xl bg-gray-100 font-semibold">
                    Cancel
                </button>

                <button @click="confirmDelete" class="px-4 py-2 rounded-xl bg-red-600 text-white font-bold">
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>
