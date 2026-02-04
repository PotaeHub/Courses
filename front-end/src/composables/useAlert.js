// src/composables/useAlert.js
import Swal from 'sweetalert2'

export function useAlert() {
    const success = (title = 'Success', text = '') => {
        return Swal.fire({
            icon: 'success',
            title,
            text,
            confirmButtonColor: '#22c55e'
        })
    }

    const error = (err,) => {
        const message =
            err?.response?.data?.message ||
            err?.message

        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#ef4444'
        })
    }

    const warning = (title, text) => {
        return Swal.fire({
            icon: 'warning',
            title,
            text,
            confirmButtonColor: '#f97316'
        })
    }

    const confirm = async ({
        title = 'Are you sure?',
        text = 'This action cannot be undone',
        confirmText = 'Yes, delete it',
        cancelText = 'Cancel',
        confirmColor = '#ef4444'
    } = {}) => {
        const result = await Swal.fire({
            icon: 'warning',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            confirmButtonColor: confirmColor,
            cancelButtonColor: '#94a3b8'
        })

        return result.isConfirmed
    }

    return {
        success,
        error,
        warning,
        confirm
    }
}
