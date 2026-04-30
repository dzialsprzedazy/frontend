<script setup>
import { ref, computed, onMounted } from "vue"
import api from "@/services/axios.js"
import { useAlerts } from "@/components/alerts/useAlerts.js"

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(["close", "product-added"])
const { showAlert } = useAlerts()

const isSubmitting = ref(false)
const isLoadingData = ref(false)

const authors = ref([])
const categories = ref([])

const formData = ref({
  nazwaProduktu: "",
  idAutora: "",
  cena: 0.0,
  stanMagazynowy: 0,
  dataWydania: "",
  opis: "",
  czyUkryty: false,
})

const selectedCategoryId = ref(null)
const authorQuery = ref("")
const showAuthorDropdown = ref(false)

const imageFile = ref(null)
const imagePreview = ref(null)
const isDraggingImage = ref(false)
const imageInputRef = ref(null)

const filteredAuthors = computed(() => {
  const query = authorQuery.value.toLowerCase().trim()
  if (!query) return authors.value
  return authors.value.filter((a) =>
    `${a.imie} ${a.nazwisko}`.toLowerCase().includes(query),
  )
})

const loadDictionaries = async () => {
  isLoadingData.value = true
  try {
    const [catRes, autRes] = await Promise.all([
      api.get("categories"),
      api.get("autors"),
    ])
    categories.value = catRes.data
    authors.value = autRes.data
  } catch (error) {
    showAlert({
      type: "error",
      message: "Connection error: Failed to fetch categories or authors.",
      position: "top-right",
    })
  } finally {
    isLoadingData.value = false
  }
}

onMounted(loadDictionaries)

const selectAuthor = (author) => {
  formData.value.idAutora = author.idAutora
  authorQuery.value = `${author.imie} ${author.nazwisko}`
  showAuthorDropdown.value = false
}

const handleAuthorInput = () => {
  formData.value.idAutora = ""
  showAuthorDropdown.value = true
}

const clearAuthor = () => {
  authorQuery.value = ""
  formData.value.idAutora = ""
  showAuthorDropdown.value = true
}

const triggerImageSelect = () => imageInputRef.value.click()

const handleImageDrop = (event) => {
  isDraggingImage.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith("image/")) {
    setImage(file)
  } else {
    showAlert({
      type: "error",
      message: "Invalid file type. Please upload an image.",
    })
  }
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) setImage(file)
}

const setImage = (file) => {
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  imageFile.value = null
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
  if (imageInputRef.value) imageInputRef.value.value = ""
}

const resetForm = () => {
  formData.value = {
    nazwaProduktu: "",
    idAutora: "",
    cena: 0.0,
    stanMagazynowy: 0,
    dataWydania: "",
    opis: "",
    czyUkryty: false,
  }
  authorQuery.value = ""
  selectedCategoryId.value = null
  removeImage()
}

const handleClose = () => {
  resetForm()
  emit("close")
}

const handleSubmit = async () => {
  if (
    !formData.value.nazwaProduktu ||
    !formData.value.idAutora ||
    !selectedCategoryId.value ||
    !formData.value.dataWydania
  ) {
    showAlert({
      type: "error",
      message: "Please fill in all required fields.",
      position: "top-right",
    })
    return
  }

  try {
    isSubmitting.value = true

    // Tworzymy payload bez zdjęcia
    const payload = {
      ...formData.value,
      idAutora: Number(formData.value.idAutora),
      cena: Number(formData.value.cena),
      stanMagazynowy: Number(formData.value.stanMagazynowy),
      kategorieIds: [selectedCategoryId.value],
    }

    // Wysłanie danych do API
    await api.post("products", payload)

    showAlert({
      type: "success",
      message: "Product added successfully!",
      position: "top-right",
    })

    // Odświeżenie listy w rodzicu
    emit("product-added")
    handleClose()
  } catch (error) {
    showAlert({
      type: "error",
      message:
        error.response?.data?.message ||
        "An error occurred while adding the product.",
      position: "top-right",
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Add New Product</h3>
          <button class="close-btn" @click="handleClose">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingData" class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading data...
          </div>

          <form v-else @submit.prevent="handleSubmit" class="product-form">
            <div class="form-row">
              <div class="form-group flex-2">
                <label>Product Name <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="formData.nazwaProduktu"
                  placeholder="e.g. The Hunger Games"
                  required
                />
              </div>

              <div class="form-group flex-1 author-dropdown-container">
                <label>Author <span class="required">*</span></label>
                <div class="combobox-wrapper">
                  <input
                    type="text"
                    v-model="authorQuery"
                    placeholder="Search author..."
                    @input="handleAuthorInput"
                    @focus="showAuthorDropdown = true"
                    @blur="showAuthorDropdown = false"
                    required
                  />
                  <i
                    v-if="authorQuery"
                    class="fa-solid fa-xmark clear-icon"
                    @mousedown.prevent="clearAuthor"
                  ></i>
                  <i v-else class="fa-solid fa-chevron-down arrow-icon"></i>

                  <ul v-if="showAuthorDropdown" class="dropdown-list">
                    <li
                      v-for="author in filteredAuthors"
                      :key="author.idAutora"
                      @mousedown.prevent="selectAuthor(author)"
                    >
                      {{ author.imie }} {{ author.nazwisko }}
                    </li>
                    <li v-if="filteredAuthors.length === 0" class="no-results">
                      No authors found.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Price (PLN)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model="formData.cena"
                />
              </div>
              <div class="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  v-model="formData.stanMagazynowy"
                />
              </div>
              <div class="form-group">
                <label>Release Date <span class="required">*</span></label>
                <input type="date" v-model="formData.dataWydania" required />
              </div>
            </div>

            <div class="form-group full-width">
              <label>Product Image (Disabled currently)</label>
              <div
                class="image-dropzone"
                :class="{
                  'is-dragging': isDraggingImage,
                  'has-image': imagePreview,
                }"
                @dragover.prevent="isDraggingImage = true"
                @dragleave.prevent="isDraggingImage = false"
                @drop.prevent="handleImageDrop"
              >
                <input
                  type="file"
                  accept="image/*"
                  class="hidden-input"
                  ref="imageInputRef"
                  @change="handleImageChange"
                />

                <div
                  v-if="!imagePreview"
                  class="upload-content"
                  @click="triggerImageSelect"
                >
                  <i class="fa-solid fa-cloud-arrow-up drop-icon"></i>
                  <p><strong>Click to upload</strong> or drag and drop</p>
                  <span>PNG, JPG, WEBP</span>
                </div>

                <div v-else class="image-preview-container">
                  <img :src="imagePreview" alt="Preview" class="preview-img" />
                  <div class="preview-overlay">
                    <button
                      type="button"
                      class="replace-btn"
                      @click.stop="triggerImageSelect"
                    >
                      <i class="fa-solid fa-pen"></i> Replace
                    </button>
                    <button
                      type="button"
                      class="remove-btn"
                      @click.stop="removeImage"
                    >
                      <i class="fa-solid fa-trash"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Category <span class="required">*</span></label>
              <div class="category-pills">
                <div
                  v-for="cat in categories"
                  :key="cat.idKategorii"
                  class="pill-label"
                  :class="{ active: selectedCategoryId === cat.idKategorii }"
                  @click="selectedCategoryId = cat.idKategorii"
                >
                  {{ cat.nazwaKategorii }}
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Description</label>
              <textarea
                v-model="formData.opis"
                rows="3"
                placeholder="Write a short description..."
              ></textarea>
            </div>

            <div class="form-group checkbox-group">
              <label class="switch-wrap">
                <input type="checkbox" v-model="formData.czyUkryty" />
                <span class="slider"></span>
              </label>
              <span class="switch-label">Hide product from public store</span>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button
            class="btn-text"
            @click="handleClose"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            class="btn-primary"
            @click="handleSubmit"
            :disabled="isSubmitting"
          >
            <i class="fa-solid fa-spinner fa-spin" v-if="isSubmitting"></i>
            <i class="fa-solid fa-check" v-else></i>
            {{ isSubmitting ? "Saving..." : "Save Product" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
:root {
  --nv-z: 10000;
}
.Notivue__wrapper {
  z-index: 10000 !important;
}
</style>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(21, 14, 36, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-box {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eae8f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #151875;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8a8fb9;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}
.close-btn:hover {
  background-color: #f6f5ff;
  color: #151875;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 120px;
}
.flex-2 {
  flex: 2;
  min-width: 200px;
}
.flex-1 {
  flex: 1;
  min-width: 150px;
}
.full-width {
  width: 100%;
  flex: none;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #151875;
}
.required {
  color: #fb2e86;
  margin-left: 2px;
}

input[type="text"],
input[type="number"],
input[type="date"],
textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #150e24;
  background-color: #f8f9ff;
  transition: all 0.3s ease;
  outline: none;
}

input:focus,
textarea:focus {
  border-color: #3f509e;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(63, 80, 158, 0.1);
}

.author-dropdown-container {
  position: relative;
}
.combobox-wrapper {
  position: relative;
}
.arrow-icon,
.clear-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a8fb9;
  font-size: 0.9rem;
}
.arrow-icon {
  pointer-events: none;
}
.clear-icon {
  cursor: pointer;
  transition: color 0.2s;
}
.clear-icon:hover {
  color: #fb2e86;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  margin-top: 4px;
  padding: 0.5rem 0;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
}

.dropdown-list li {
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: #4a405c;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.dropdown-list li:hover {
  background-color: #f6f5ff;
  color: #3f509e;
}
.dropdown-list .no-results {
  color: #8a8fb9;
  font-style: italic;
  cursor: default;
  padding: 0.6rem 1rem;
}

.image-dropzone {
  border: 2px dashed #dcdcdc;
  border-radius: 12px;
  background-color: #f8f9ff;
  transition: all 0.2s ease;
  position: relative;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.image-dropzone.is-dragging {
  border-color: #3f509e;
  background-color: #f0f2f8;
}
.image-dropzone.has-image {
  border-style: solid;
  border-color: #eae8f5;
  background: #000;
}
.hidden-input {
  display: none;
}

.upload-content {
  text-align: center;
  cursor: pointer;
  padding: 2rem;
  width: 100%;
}
.drop-icon {
  font-size: 2rem;
  color: #3f509e;
  margin-bottom: 0.5rem;
}
.upload-content p {
  color: #150e24;
  font-size: 0.95rem;
  margin: 0;
}
.upload-content span {
  color: #8a8fb9;
  font-size: 0.8rem;
}

.image-preview-container {
  width: 100%;
  height: 200px;
  position: relative;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.2s;
}
.image-preview-container:hover .preview-overlay {
  opacity: 1;
}

.replace-btn,
.remove-btn {
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.replace-btn {
  background: #ffffff;
  color: #151875;
}
.remove-btn {
  background: #e03a5b;
  color: white;
}

.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.pill-label {
  padding: 0.5rem 1rem;
  background-color: #f0f2f8;
  color: #8a8fb9;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  user-select: none;
}
.pill-label.active {
  background-color: #3f509e;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(63, 80, 158, 0.2);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
.switch-wrap {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch-wrap input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #dcdcdc;
  transition: 0.4s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #3f509e;
}
input:checked + .slider:before {
  transform: translateX(20px);
}
.switch-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4a405c;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background-color: #fbfbfe;
  border-top: 1px solid #eae8f5;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary {
  background-color: #3f509e;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:hover:not(:disabled) {
  background-color: #2e3b75;
  transform: translateY(-1px);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-text {
  background: transparent;
  color: #8a8fb9;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #3f509e;
  font-weight: 600;
}
</style>
