import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URI,

  // timeout, po którym zapytanie zostanie przerwane, jeśli serwer nie odpowiada
  timeout: 10000,
})

export default api
