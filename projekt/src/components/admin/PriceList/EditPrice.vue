<template>
  <AlertDisplay />
  <div class="admin-container">
    <div class="indent">
      <header>Edycja ceny biletu</header>
      <form @submit.prevent="updateTicket">
        <div class="field">
          <label for="name">Nazwa biletu</label>
          <input
            type="text"
            id="name"
            v-model="editedTicket.name"
            required
            :readonly="true"
            disabled
          />
        </div>

        <div class="field">
          <label for="price">Cena biletu</label>
          <input
            type="number"
            id="price"
            v-model="editedTicket.price"
            required
          />
        </div>

        <button type="submit" class="submit-btn">Zapisz zmiany</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

import {
  createCustomError,
  handleErrors,
} from "../../../../errors/ErrorHandler.js"
import alertService from "@/components/alerts/AlertService.js"
import AlertDisplay from "@/components/alerts/AlertDisplay.vue"

const URL = import.meta.env.VITE_BACKEND_URI + "tickets"

const fetchError = ref(null)
const editedTicket = ref({
  name: "",
  price: 0,
})

const router = useRoute()
const ticketID = router.params.id

const fetchTicketData = async () => {
  try {
    const response = await axios.get(URL)
    const ticketsArray = response.data.tickets

    if (Array.isArray(ticketsArray) && ticketsArray.length > 0) {
      const foundTicket = ticketsArray.find((ticket) => ticket._id === ticketID)

      if (foundTicket) {
        editedTicket.value = foundTicket
      } else {
        throw new Error("Bilet o podanym ID nie został znaleziony")
      }
    } else {
      throw new Error("Nieprawidłowa odpowiedź z serwera")
    }
  } catch (error) {
    handleErrors(error, fetchError)
  }
}

const updateTicket = async () => {
  try {
    const priceAsNumber = parseInt(editedTicket.value.price, 10)

    if (priceAsNumber <= 0 || !Number.isInteger(priceAsNumber)) {
      return alertService.addAlert(
        "Cena biletu musi być liczbą całkowitą dodatnią",
        "error",
      )
    }

    await axios.patch(`${URL}/${ticketID}`, editedTicket.value)

    alertService.addAlert(
      "Zaktualizowano cenę biletu.",
      "success",
      "/admin/cennik",
    )
  } catch (error) {
    handleErrors(error, fetchError)
  }
}

onMounted(fetchTicketData)
</script>

<style scoped>
.admin-container {
  width: clamp(200px, 100%, 600px);
}

.admin-container header {
  font-size: 23px;
  text-transform: uppercase;
  margin-bottom: 3rem;
}

.admin-container .indent {
  margin-left: 3rem;
}

.admin-container form .field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1.3rem;
}

.admin-container form .field input {
  max-width: 350px;
  width: 100%;
  padding: 8px 15px;
  border-radius: 5px;
  border: 1px solid black;
  font-size: 1.05rem;
}

.admin-container .submit-btn {
  float: right;
  background: #686868;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  text-transform: uppercase;
  cursor: pointer;
}
</style>
