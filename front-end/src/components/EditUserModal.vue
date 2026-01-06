<script setup>
import { ref, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
    show: Boolean,
    user: Object
})

const emit = defineEmits(['close', 'save'])

const form = ref({
    name: '',
    role: 'STUDENT',

    // student
    gradeLevel: '',
    classroom: '',
    phone: '',

    // teacher
    subject: '',
    experience: '',
})

watch(
    () => props.user,
    (u) => {
        if (!u) return

        form.value = {
            name: u.name || '',
            role: u.role || 'STUDENT',

            gradeLevel: u.studentProfile?.gradeLevel || '',
            classroom: u.studentProfile?.classroom || '',
            phone:
                u.studentProfile?.phone ||
                u.teacherProfile?.phone ||
                u.adminProfile?.phone ||
                '',

            subject: u.teacherProfile?.subject || '',
            experience:
                u.teacherProfile?.experience 
        }
    },
    { immediate: true }
)

const handleSave = () => {
    emit('save', {
        id: props.user.id,
        ...form.value
    })
}
</script>



<template>
    <BaseModal :show="show" title="แก้ไขผู้ใช้" @close="emit('close')">
        <div class="space-y-4">
            <div>
                <label class="text-sm">ชื่อ</label>
                <input v-model="form.name" class="w-full border rounded-lg px-3 py-2" />
            </div>
            <!-- STUDENT -->
            <div v-if="form.role === 'STUDENT'" class="space-y-3">
                <div>
                    <label class="text-sm">ระดับชั้น</label>
                    <input v-model="form.gradeLevel" class="w-full border rounded-lg px-3 py-2" />
                </div>

                <div>
                    <label class="text-sm">ห้อง</label>
                    <input v-model="form.classroom" class="w-full border rounded-lg px-3 py-2" />
                </div>

                <div>
                    <label class="text-sm">เบอร์โทร</label>
                    <input v-model="form.phone" class="w-full border rounded-lg px-3 py-2" />
                </div>
            </div>

            <!-- TEACHER -->
            <div v-if="form.role === 'TEACHER'" class="space-y-3">
                <div>
                    <label class="text-sm">วิชา</label>
                    <input v-model="form.subject" class="w-full border rounded-lg px-3 py-2" />
                </div>

                <div>
                    <label class="text-sm">ประสบการณ์</label>
                    <input v-model="form.experience" class="w-full border rounded-lg px-3 py-2" />
                </div>

                <div>
                    <label class="text-sm">เบอร์โทร</label>
                    <input v-model="form.phone" class="w-full border rounded-lg px-3 py-2" />
                </div>
            </div>

            <!-- ADMIN -->
            <div v-if="form.role === 'ADMIN'" class="space-y-3">
                <div>
                    <label class="text-sm">ตำแหน่ง / ประสบการณ์</label>
                    <input v-model="form.experience" class="w-full border rounded-lg px-3 py-2" />
                </div>

                <div>
                    <label class="text-sm">เบอร์โทร</label>
                    <input v-model="form.phone" class="w-full border rounded-lg px-3 py-2" />
                </div>
            </div>

            <div>
                <label class="text-sm">Role</label>
                <select v-model="form.role" class="w-full border rounded-lg px-3 py-2">
                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </div>

            <div class="flex justify-end gap-2 pt-4">
                <button @click="emit('close')" class="px-4 py-2 text-gray-600">
                    ยกเลิก
                </button>
                <button @click="handleSave" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    บันทึก
                </button>
            </div>
        </div>
    </BaseModal>
</template>
