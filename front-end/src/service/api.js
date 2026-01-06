import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    res => res,
    async err => {
        const originalRequest = err.config;

        if (
            err.response &&
            err.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const { data } = await api.get("/refresh");
                const accessToken = data.accessToken;

                localStorage.setItem("accessToken", accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token failed", refreshError);

                // clear token + redirect
                localStorage.removeItem("accessToken");
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(err);
    }
);

export default api;
