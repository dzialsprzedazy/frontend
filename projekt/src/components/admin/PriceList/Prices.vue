<template>
  <AlertDisplay />
  <div class="admin-container">
    <header>
      <h1>Cennik</h1>
      <div class="icon">
        <img src="../../../assets/img/ticket-icon.svg" alt="Prices Icon" />
      </div>
    </header>

    <div class="indent">
      <div v-if="fetchError">{{ fetchError }}</div>
      <div v-if="isLoading">Loading...</div>
      <div v-else>
        <div v-for="ticket in tickets" :key="ticket._id" class="room">
          <div class="left">
            <span class="name">Bilet {{ ticket.name }}</span>
            <span class="quantity">Cena: {{ ticket.price }} zł</span>
          </div>
          <div class="right">
            <RouterLink
              :to="{ name: 'EditTicket', params: { id: ticket._id } }"
              class="btn btn-edit"
              style="text-decoration: none; color: black"
            >
              Edytuj
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { onMounted, ref } from "vue"

import AlertDisplay from "@/components/alerts/AlertDisplay.vue"
import {
  createCustomError,
  handleErrors,
} from "../../../../errors/ErrorHandler.js"
import alertService from "@/components/alerts/AlertService.js"

const fetchError = ref(null)

const URL = import.meta.env.VITE_BACKEND_URI + "tickets"

const tickets = ref([])
const isLoading = ref(true)

const fetchTicketData = async () => {
  try {
    const response = await axios.get(URL)
    tickets.value = response.data.tickets
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchTicketData)
</script>

<style scoped>
.admin-container header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-container header h1 {
  font-size: 35px;
  font-weight: 500;
}

.admin-container header .icon img {
  width: 45px;
}

.admin-container .indent {
  margin-left: 3rem;
  margin-top: 3rem;
}

.admin-container .room {
  position: relative;
  display: flex;
  width: clamp(200px, 100%, 500px);
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.admin-container .room:after {
  position: absolute;
  content: "";
  left: 0;
  bottom: -25px;
  width: 100%;
  height: 1px;
  background: #ccc;
  border-radius: 7px;
}

.admin-container .room .left {
  display: flex;
  flex-direction: column;
  font-size: 1.1rem;
}

.admin-container .room .left .name {
  font-weight: 500;
}

.admin-container .room .left .quantity {
  font-weight: 300;
}

.admin-container .room .right .btn {
  border: none;
  background: none;
  padding: 8px 13px;
  margin-right: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.admin-container .room .right .btn:hover {
  cursor: pointer;
}

.admin-container .room .right .btn:last-child {
  margin-right: 0;
}

.admin-container .room .right .btn-edit {
  border: 1px solid black;
}

.admin-container .room .right .btn-delete {
  border: 1px solid crimson;
  color: crimson;
}
</style>

<!--     @TODO Price Icon    -->
