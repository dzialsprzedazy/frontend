import { ref } from "vue"
import router from "@/router/index.js"

class AlertService {
  alerts = ref([])

  addAlert(message, type = "info", route) {
    this.alerts.value.push({ message, type })
    if (type !== "error") router.push(route)

    setTimeout(() => {
      this.clearAlerts()
    }, 3500)
  }

  clearAlerts() {
    this.alerts.value = []
  }
}

const alertService = new AlertService()

export default alertService
