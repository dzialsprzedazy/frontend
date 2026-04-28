import "./assets/main.css"

import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"

// Notivue [Notifications for Vue 3]
import { createNotivue } from "notivue"
import "notivue/notifications.css"

const notivue = createNotivue({
  position: "top-right",

  notifications: {
    duration: 3000,
    pauseOnHover: true,
    dismissible: true, // you can dismiss the notification by clicking on it
    swipe: true, // you can dismiss the notification by swiping it (on touch devices)
  },
})

const app = createApp(App)

app.use(router).use(notivue).mount("#app")
