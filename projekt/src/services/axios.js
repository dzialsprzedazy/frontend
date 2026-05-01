import axios from "axios"
import router from "@/router"

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URI,
  // timeout in milliseconds
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptor to handle 401 Unauthorized responses globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // If the error is a 401 Unauthorized, it means the token is invalid or expired
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized access - redirecting to login.")

      localStorage.removeItem("token")
      localStorage.removeItem("user")

      // Redirect to login page
      router.push("/login")
    }

    // Return the error further, in case the component wants to handle other statuses (e.g., 404, 400)
    return Promise.reject(error)
  },
)

export default api
