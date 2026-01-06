<script setup>
import { computed, onMounted, ref } from "vue"
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
    const res = await api.get("/admin/users")
    users.value = res.data.data
    console.log(res.data)
    loading.value = false
}

const handleFilter = (filters) => {
    currentFilters.value = filters
}

const handleEdit = (user) => {
    selectedUser.value = user
    showModal.value = true
}

const handleView = (user) => {
    selectedUser.value = user
    showProfileModal.value = true
}

const handleDelete = async (id) => {
    if (!confirm('ยืนยันลบผู้ใช้?')) return
    await api.delete(`/admin/remove-user/${id}`)
    fetchUser()
}

const handleSave = async (user) => {
    await api.put(`/admin/edit-user/${user.id}`, user)
    showModal.value = false
    fetchUser()
}

const filteredUsers = computed(() => {
    const search = currentFilters.value.search.toLowerCase()
    return users.value.filter(user => {
        const matchSearch =
            user.name?.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)

        const matchRole = currentFilters.value.role
            ? user.role === currentFilters.value.role
            : true

        return matchSearch && matchRole
    })
})

onMounted(fetchUser)
</script>

<template>
    <div class="p-6">
        <UserFilter @filter-change="handleFilter" />
        <UserTable :users="filteredUsers" :loading="false" @edit="handleEdit" @delete="handleDelete"
            @view="handleView" />
        <EditUserModal :show="showModal" :user="selectedUser" @close="showModal = false" @save="handleSave" />
        <ProfileModal :show="showProfileModal" :user="selectedUser" @close="showProfileModal = false" />
    </div>
</template>