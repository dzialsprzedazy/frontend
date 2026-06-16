<script setup>
import { ref, onMounted } from "vue"
import api from "@/services/axios.js"
import { useAlerts } from "@/components/alerts/useAlerts.js"

const props = defineProps({
  show: Boolean,
  productId: Number
})

const emit = defineEmits(["close", "product-updated"])
const { showAlert } = useAlerts()

const isLoading = ref(true)
const form = ref({
  nazwaProduktu: "",
  idAutora: null,
  cena: 0,
  opis: "",
  zdjecie: "",
  stanMagazynowy: 0,
  czyUkryty: false,
  dataWydania: "",
  kategorieIds: [],
  tagiIds: []
})

onMounted(async () => {
  if (props.productId) {
    await fetchProductDetails()
  }
})

const fetchProductDetails = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get(`products/${props.productId}`)
    
    form.value = {
      nazwaProduktu: data.nazwaProduktu || "",
      idAutora: data.idAutora,
      cena: data.cena || 0,
      opis: data.opis || "",
      zdjecie: data.zdjecie || "",
      stanMagazynowy: data.stanMagazynowy || 0,
      czyUkryty: data.czyUkryty || false,
      dataWydania: data.dataWydania ? data.dataWydania.split('T')[0] : "",
      kategorieIds: data.kategorie ? data.kategorie.map(k => k.idKategorii) : [],
      tagiIds: data.tagi ? data.tagi.map(t => t.idTagu) : []
    }
  } catch (error) {
    showAlert({ type: "error", message: "Nie udało się załadować danych produktu." })
    emit("close")
  } finally {
    isLoading.value = false
  }
}

const submitEdit = async () => {
  isLoading.value = true
  try {
    await api.put(`products/${props.productId}`, form.value)
    showAlert({ type: "success", message: "Produkt został zaktualizowany." })
    emit("product-updated")
    emit("close")
  } catch (error) {
    console.error("Szczegóły błędu API:", error.response?.data)
    
    const errorMsg = typeof error.response?.data === 'string' 
      ? error.response.data 
      : error.response?.data?.title || "Błąd podczas zapisywania produktu."
      
    showAlert({ type: "error", message: `Błąd: ${errorMsg}` })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Edytuj Produkt</h3>
          <button class="close-btn" @click="emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body" v-if="isLoading">
          <div class="loading-container">
            <div class="loader-circle"></div>
            <p>Ładowanie danych...</p>
          </div>
        </div>

        <div class="modal-body" v-else>
          <div class="form-group">
            <label>Nazwa Produktu</label>
            <input type="text" v-model="form.nazwaProduktu" class="form-input" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Cena (PLN)</label>
              <input type="number" step="0.01" v-model.number="form.cena" class="form-input" />
            </div>
            <div class="form-group">
              <label>Stan Magazynowy</label>
              <input type="number" v-model.number="form.stanMagazynowy" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data Wydania</label>
              <input type="date" v-model="form.dataWydania" class="form-input" />
            </div>
            <div class="form-group">
              <label>ID Autora</label>
              <input type="number" v-model.number="form.idAutora" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Zdjęcie (URL)</label>
            <input type="text" v-model="form.zdjecie" class="form-input" />
          </div>

          <div class="form-group">
            <label>Opis</label>
            <textarea v-model="form.opis" class="form-input" rows="4"></textarea>
          </div>

          <div class="form-group checkbox-group">
            <input type="checkbox" id="ukryty" v-model="form.czyUkryty" />
            <label for="ukryty">Ukryj produkt w sklepie</label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-text" @click="emit('close')">Anuluj</button>
          <button class="btn-primary" @click="submitEdit" :disabled="isLoading">
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(21, 14, 36, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: #ffffff; border-radius: 16px; width: 100%; max-width: 600px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #eae8f5; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; color: #151875; font-size: 1.25rem; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #8a8fb9; padding: 4px; border-radius: 4px; }
.close-btn:hover { background-color: #f6f5ff; color: #151875; }
.modal-body { padding: 1.5rem; max-height: 65vh; overflow-y: auto; }
.form-group { margin-bottom: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #4a405c; }
.form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #eae8f5; border-radius: 8px; background: #fbfbfe; font-family: inherit; font-size: 0.95rem; color: #150e24; outline: none; transition: all 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: #3f509e; background: #ffffff; box-shadow: 0 0 0 3px rgba(63, 80, 158, 0.1); }
.checkbox-group { display: flex; align-items: center; gap: 0.5rem; }
.checkbox-group input { width: 16px; height: 16px; cursor: pointer; accent-color: #3f509e; }
.checkbox-group label { margin: 0; cursor: pointer; }
.modal-footer { padding: 1rem 1.5rem; background: #fbfbfe; border-top: 1px solid #eae8f5; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-text { background: transparent; border: none; font-weight: 600; cursor: pointer; color: #8a8fb9; padding: 0.8rem 1.2rem; border-radius: 8px; }
.btn-text:hover { color: #151875; background-color: #f6f5ff; }
.btn-primary { background: #3f509e; color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { background-color: #2e3b75; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(63, 80, 158, 0.2); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 0; color: #3f509e; font-weight: 600; }
.loader-circle { border: 3px solid #f3f3f3; border-top: 3px solid #3f509e; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>