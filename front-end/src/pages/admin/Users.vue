<script setup>
import { computed, onMounted, ref } from "vue"
import Swal from "sweetalert2" // ต้องติดตั้ง npm install sweetalert2
import api from "../../service/api.js"
import UserFilter from "../../components/UserFilter.vue"
import UserTable from "../../components/UserTable.vue"
import EditUserModal from "../../components/EditUserModal.vue"
import ProfileModal from "../../components/ProfileModal.vue"

const users = ref([])
const loading = ref(false)
const showModal = ref(false)
const selectedUser = ref(null)
const showProfileModal = ref(false)

const currentFilters = ref({
    search: '',
    role: '',
    sortBy: 'createdAt'
})

const fetchUser = async () => {
    loading.value = true
    try {
        const res = await api.get("/admin/users")
        users.value = res.data.data
    } catch (error) {
        console.error("Fetch error:", error)
    } finally {
        loading.value = false
    }
}

const handleFilter = (filters) => {
    currentFilters.value = filters
}

const handleEdit = (user) => {
    selectedUser.value = { ...user } // Clone object ป้องกันการเปลี่ยนค่าในตารางทันที
    showModal.value = true
}

const handleView = (user) => {
    selectedUser.value = user
    showProfileModal.value = true
}

// ฟังก์ชันลบผู้ใช้ พร้อม SweetAlert2
const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'ยืนยันการลบผู้ใช้?',
        text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ยืนยัน ลบเลย',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        customClass: {
            popup: 'rounded-[2rem]',
            confirmButton: 'rounded-xl px-6 py-2.5',
            cancelButton: 'rounded-xl px-6 py-2.5'
        }
    })

    if (result.isConfirmed) {
        try {
            await api.delete(`/admin/remove-user/${id}`)
            await Swal.fire({
                title: 'ลบสำเร็จ!',
                text: 'ข้อมูลผู้ใช้ถูกลบออกจากระบบแล้ว',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-[2rem]' }
            })
            fetchUser()
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบข้อมูลได้', 'error')
        }
    }
}

const handleSave = async (user) => {
    try {
        await api.put(`/admin/edit-user/${user.id}`, user)
        showModal.value = false

        Swal.fire({
            title: 'บันทึกสำเร็จ',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: { popup: 'rounded-xl' }
        })

        fetchUser()
    } catch (error) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error')
    }
}

const filteredUsers = computed(() => {
    const search = currentFilters.value.search.toLowerCase()
    return users.value.filter(user => {
        const matchSearch =
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)

        const matchRole = currentFilters.value.role
            ? user.role === currentFilters.value.role
            : true

        return matchSearch && matchRole
    })
})

onMounted(fetchUser)
</script>

<template>
    <div class="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50 antialiased">

        <div class="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight transition-all">
                    User <span class="text-blue-600">Management</span>
                </h1>
                <p class="text-gray-500 font-medium flex items-center gap-2">
                    <span class="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึงในระบบ
                </p>
            </div>

            <div
                class="bg-white p-2 rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-200/40 backdrop-blur-sm">
                <UserFilter @filter-change="handleFilter" />
            </div>
        </div>

        <div
            class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 transition-all duration-500 hover:border-blue-100">
            <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
                <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-gray-400 font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>

            <UserTable v-else :users="filteredUsers" :loading="loading" @edit="handleEdit" @delete="handleDelete"
                @view="handleView" class="w-full" />

            <div v-if="!loading && filteredUsers.length === 0" class="py-20 text-center">
                <div class="text-gray-300 mb-4 text-6xl">🔍</div>
                <p class="text-gray-500 text-lg font-medium">ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข</p>
            </div>
        </div>

        <div class="mt-8 flex items-center gap-4 px-4">
            <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            <div class="bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <p class="text-[12px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                    Total <span class="text-blue-600">{{ filteredUsers.length }}</span> Registered Users
                </p>
            </div>
            <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        <EditUserModal :show="showModal" :user="selectedUser" @close="showModal = false" @save="handleSave" />

        <ProfileModal :show="showProfileModal" :user="selectedUser" @close="showProfileModal = false" />
    </div>
</template>

<style scoped>
/* เพิ่มความสมูทในการเปลี่ยนหน้าตาราง */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>