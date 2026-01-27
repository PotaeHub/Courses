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
    <BaseModal :show="show" title="แก้ไขข้อมูลผู้ใช้" @close="emit('close')">
        <div class="space-y-6 py-2">
            <div class="space-y-4">
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-1 h-4 bg-blue-600 rounded-full"></span>
                    <h3 class="font-semibold text-gray-700">ข้อมูลพื้นฐาน</h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label
                            class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                        <input v-model="form.name" type="text" placeholder="กรอกชื่อผู้ใช้งาน"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" />
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">บทบาทระบบ
                            (Role)</label>
                        <select v-model="form.role"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="STUDENT">นักเรียน (STUDENT)</option>
                            <option value="TEACHER">อาจารย์ (TEACHER)</option>
                            <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                        </select>
                    </div>
                </div>
            </div>

            <hr class="border-gray-100" />

            <div class="space-y-4">
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-1 h-4 bg-indigo-500 rounded-full"></span>
                    <h3 class="font-semibold text-gray-700">ข้อมูลเพิ่มเติมตามตำแหน่ง</h3>
                </div>

                <div v-if="form.role === 'STUDENT'"
                    class="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">ระดับชั้น</label>
                            <input v-model="form.gradeLevel" placeholder="เช่น ม.6"
                                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">ห้อง</label>
                            <input v-model="form.classroom" placeholder="เช่น 6/1"
                                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                        <input v-model="form.phone" type="tel"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                    </div>
                </div>

                <div v-if="form.role === 'TEACHER'"
                    class="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">กลุ่มสาระ / วิชาที่สอน</label>
                        <input v-model="form.subject" placeholder="ระบุวิชาหลัก"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">ประสบการณ์ (ปี)</label>
                            <input v-model="form.experience" type="number"
                                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</label>
                            <input v-model="form.phone"
                                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                </div>

                <div v-if="form.role === 'ADMIN'" class="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">ตำแหน่งทางการบริหาร</label>
                        <input v-model="form.experience" placeholder="เช่น หัวหน้าฝ่ายทะเบียน"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">เบอร์โทรศัพท์ภายใน</label>
                        <input v-model="form.phone"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6">
                <button @click="emit('close')"
                    class="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    ยกเลิก
                </button>
                <button @click="handleSave"
                    class="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
                    บันทึกข้อมูล
                </button>
            </div>
        </div>
    </BaseModal>
</template>
