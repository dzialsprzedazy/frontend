<script setup>
import axios from "axios"
import { onMounted, ref } from "vue"

import AlertDisplay from "@/components/alerts/AlertDisplay.vue"
import {
  createCustomError,
  handleErrors,
} from "../../../../errors/ErrorHandler.js"
import { addMinutes, format } from "date-fns"

const fetchError = ref(null)

const URL = import.meta.env.VITE_BACKEND_URI + "screenings"

const screenings = ref([])
const isLoading = ref(true)

const fetchScreeningDataForToday = async () => {
  try {
    // Uzyskaj dzisiejszą datę w formacie 'DD-MM-YYYY'
    const today = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("-")

    // Dodaj parametr date do URL zapytania
    const response = await axios.get(`${URL}?date=${today}`)
    screenings.value = response.data.screenings
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchScreeningDataForToday)
</script>

<template>
  <div class="overview">
    <div class="title" style="margin-top: 0">
      <i class="uil uil-tachometer-fast-alt"></i>
      <span class="text">Social Media</span>
    </div>

    <div class="boxes">
      <div class="box box1">
        <i class="uil uil-thumbs-up"></i>
        <span class="text">Total Likes</span>
        <span class="number">50,120</span>
      </div>
      <div class="box box2">
        <i class="uil uil-comments"></i>
        <span class="text">Comments</span>
        <span class="number">20,120</span>
      </div>
      <div class="box box3">
        <i class="uil uil-share"></i>
        <span class="text">Total Share</span>
        <span class="number">10,120</span>
      </div>
    </div>
  </div>

  <div class="activity">
    <div class="title">
      <i class="uil uil-clock-three"></i>
      <span class="text">Seanse DZISIAJ</span>
    </div>
    <div v-if="fetchError">{{ fetchError }}</div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <div class="screenings">
        <div class="screening"><b>Tytuł</b></div>
        <div class="screening"><b>Data rozpoczęcia</b></div>
        <div class="screening"><b>Data zakończenia</b></div>
        <div class="screening"><b>Nazwa sali</b></div>
      </div>
      <div v-for="screening in screenings" :key="screening._id">
        <div class="screenings">
          <div class="screening">{{ screening.movie.title }}</div>
          <div class="screening">
            {{ format(screening.date, "yyyy-MM-dd HH:mm") }}
          </div>
          <div class="screening">
            {{
              format(
                addMinutes(
                  addMinutes(screening.date, screening.advertisementsDuration),
                  screening.movie.duration,
                ),
                "yyyy-MM-dd HH:mm",
              )
            }}
          </div>
          <div class="screening">{{ screening.room.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screenings {
  display: flex;
  gap: 20px;
  font-weight: 300;
}
.screening {
  flex: 25%;
  padding: 15px 15px;
  font-size: 18px;
}
</style>
