import axios from "axios"
import { useAuthStore } from "../../Store/auth"
import router from "../routers/index"

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem("accessToken")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})


api.interceptors.response.use(
    res => res,
    error => {
        if (error.response?.status === 401) {
            const auth = useAuthStore()
            auth.logout()

        }
        return Promise.reject(error)
    }
)

export default api
