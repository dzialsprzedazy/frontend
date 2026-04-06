import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URI,

  // timeout in milliseconds
  timeout: 10000,
})

export default api
