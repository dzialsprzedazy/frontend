<script setup>
import { ref, computed, onMounted } from "vue"
import api from "@/services/axios.js"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const props = defineProps({
  show: Boolean,
  productId: Number
})

const emit = defineEmits(["close", "product-updated"])
const { showAlert } = useAlerts()

const isLoading = ref(true)
const isSubmitting = ref(false)

const authors = ref([])
const categories = ref([])
const tags = ref([])

const form = ref({
  nazwaProduktu: "",
  idAutora: null,
  cena: 0,
  opis: "",
  zdjecie: "",
  stanMagazynowy: 0,
  czyUkryty: false,
  dataWydania: "",
  kategoriaId: null,
  tagiIds: []
})

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
    `${a.imie} ${a.nazwisko}`.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  await fetchDictionaries()
  
  if (props.productId) {
    await fetchProductDetails()
  } else {
    isLoading.value = false
  }
})

const fetchDictionaries = async () => {
  try {
    const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
      api.get("autors"),
      api.get("categories"),
      api.get("tags")
    ])
    
    authors.value = authorsRes.data
    categories.value = categoriesRes.data
    tags.value = tagsRes.data
  } catch (error) {
    console.error("Error fetching dictionaries:", error)
    showAlert({ type: "error", message: "Failed to load dictionaries." })
  }
}

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
      kategoriaId: data.kategorie && data.kategorie.length > 0 ? data.kategorie[0].idKategorii : null,
      tagiIds: data.tagi ? data.tagi.map(t => t.idTagu) : []
    }

    if (form.value.zdjecie) {
      imagePreview.value = form.value.zdjecie
    }

    const selectedAuthor = authors.value.find(a => a.idAutora === form.value.idAutora)
    if (selectedAuthor) {
      authorQuery.value = `${selectedAuthor.imie} ${selectedAuthor.nazwisko}`
    }

  } catch (error) {
    showAlert({ type: "error", message: "Failed to load product details." })
    emit("close")
  } finally {
    isLoading.value = false
  }
}

const selectAuthor = (author) => {
  form.value.idAutora = author.idAutora
  authorQuery.value = `${author.imie} ${author.nazwisko}`
  showAuthorDropdown.value = false
}

const handleAuthorInput = () => {
  form.value.idAutora = null
  showAuthorDropdown.value = true
}

const clearAuthor = () => {
  authorQuery.value = ""
  form.value.idAutora = null
  showAuthorDropdown.value = true
}

const handleAuthorFocus = (event) => {
  event.target.select()
  showAuthorDropdown.value = true
}

const toggleTag = (idTagu) => {
  const index = form.value.tagiIds.indexOf(idTagu)
  if (index === -1) {
    form.value.tagiIds.push(idTagu)
  } else {
    form.value.tagiIds.splice(index, 1)
  }
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
      message: "Invalid file format. Please upload an image."
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
  form.value.zdjecie = ""
  if (imagePreview.value && imagePreview.value.startsWith("blob:")) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = null
  if (imageInputRef.value) imageInputRef.value.value = ""
}

const submitEdit = async () => {
  if (
    !form.value.nazwaProduktu ||
    !form.value.idAutora ||
    !form.value.dataWydania ||
    !form.value.kategoriaId
  ) {
    showAlert({ type: "error", message: "Please fill in all required fields." })
    return
  }

  isSubmitting.value = true
  try {
    const folderPath = `Produkt${props.productId}`

    if (imageFile.value || (!imageFile.value && !imagePreview.value)) {
      const { data: existingFiles } = await supabase.storage
        .from("Produkty")
        .list(folderPath)

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map((file) => `${folderPath}/${file.name}`)
        await supabase.storage.from("Produkty").remove(filesToRemove)
      }
    }

    if (imageFile.value) {
      const fileExt = imageFile.value.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("Produkty")
        .upload(filePath, imageFile.value)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("Produkty")
        .getPublicUrl(filePath)

      form.value.zdjecie = urlData.publicUrl
    }

    const payload = {
      ...form.value,
      kategorieIds: form.value.kategoriaId ? [form.value.kategoriaId] : []
    }

    await api.put(`products/${props.productId}`, payload)
    showAlert({ type: "success", message: "Product updated successfully." })
    emit("product-updated")
    emit("close")
  } catch (error) {
    const errorMsg = typeof error.response?.data === 'string' 
      ? error.response.data 
      : error.response?.data?.title || "An error occurred while saving the product."
      
    showAlert({ type: "error", message: `Error: ${errorMsg}` })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3>Edit Product</h3>
            <span class="subtitle">Manage product information</span>
          </div>
          <button class="close-btn" @click="emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body" v-if="isLoading">
          <div class="loading-container">
            <div class="loader-circle"></div>
            <p>Loading data...</p>
          </div>
        </div>

        <div class="modal-body custom-scrollbar" v-else>
          <div class="form-group">
            <label>Product Name <span class="required">*</span></label>
            <input type="text" v-model="form.nazwaProduktu" placeholder="Enter product name" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price (PLN)</label>
              <div class="input-icon-wrapper">
                <input type="number" step="0.01" min="0" v-model.number="form.cena" class="pl-8" />
                <i class="fa-solid fa-coins input-icon"></i>
              </div>
            </div>
            <div class="form-group">
              <label>Stock</label>
              <div class="input-icon-wrapper">
                <input type="number" min="0" v-model.number="form.stanMagazynowy" class="pl-8" />
                <i class="fa-solid fa-box input-icon"></i>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Release Date <span class="required">*</span></label>
              <input type="date" v-model="form.dataWydania" />
            </div>
            
            <div class="form-group author-dropdown-container">
              <label>Author <span class="required">*</span></label>
              <div class="combobox-wrapper">
                <input
                  type="text"
                  v-model="authorQuery"
                  placeholder="Search author..."
                  @input="handleAuthorInput"
                  @focus="handleAuthorFocus"
                  @blur="showAuthorDropdown = false"
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

          <div class="form-group full-width">
            <label>Product Image</label>
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
                    class="remove-btn-overlay"
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
                v-for="kat in categories"
                :key="kat.idKategorii"
                class="pill-label"
                :class="{ active: form.kategoriaId === kat.idKategorii }"
                @click="form.kategoriaId = kat.idKategorii"
              >
                {{ kat.nazwaKategorii }}
              </div>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Tags</label>
            <div class="category-pills">
              <div
                v-for="tag in tags"
                :key="tag.idTagu"
                class="pill-label tag"
                :class="{ active: form.tagiIds.includes(tag.idTagu) }"
                @click="toggleTag(tag.idTagu)"
              >
                #{{ tag.nazwaTagu }}
              </div>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Description</label>
            <textarea v-model="form.opis" rows="4" placeholder="Write a detailed product description..."></textarea>
          </div>

          <div class="form-group checkbox-card full-width">
            <div class="checkbox-wrapper">
              <input type="checkbox" id="ukryty" v-model="form.czyUkryty" />
              <div class="checkbox-custom"></div>
            </div>
            <label for="ukryty" class="checkbox-label">
              <span class="title">Hide product</span>
              <span class="desc">The product will not be visible to customers in the store.</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-text" @click="emit('close')" :disabled="isSubmitting || isLoading">Cancel</button>
          <button class="btn-primary" @click="submitEdit" :disabled="isSubmitting || isLoading">
            <i class="fa-solid fa-spinner fa-spin" v-if="isSubmitting"></i>
            <i class="fa-solid fa-check" v-else></i>
            {{ isSubmitting ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(21, 14, 36, 0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
}

.modal-box {
  background: #ffffff; border-radius: 16px; width: 100%; max-width: 650px;
  max-height: 90vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden;
}

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95) translateY(-20px); }

.modal-header {
  padding: 1.5rem; border-bottom: 1px solid #eae8f5;
  display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
}

.modal-header h3 { margin: 0 0 0.25rem 0; color: #151875; font-size: 1.25rem; font-weight: 700; }
.modal-header .subtitle { font-size: 0.85rem; color: #8a8fb9; }

.close-btn {
  background: transparent; border: none; color: #8a8fb9; font-size: 1.2rem;
  cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s;
}
.close-btn:hover { background-color: #f6f5ff; color: #151875; }

.modal-body { padding: 1.5rem; overflow-y: auto; flex-grow: 1; display: flex; flex-direction: column; gap: 1.25rem; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #dcd9ef; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b8b3db; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-width: 120px; margin-bottom: 0.5rem; }
.form-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.full-width { width: 100%; flex: none; }

label { font-size: 0.9rem; font-weight: 600; color: #151875; }
.required { color: #fb2e86; margin-left: 2px; }

.input-icon-wrapper { position: relative; }
.input-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #8a8fb9; font-size: 0.9rem; pointer-events: none;
}
.pl-8 { padding-left: 2.5rem !important; }

input[type="text"], input[type="number"], input[type="date"], textarea {
  width: 100%; padding: 0.75rem 1rem; border: 1px solid #dcdcdc; border-radius: 8px;
  font-family: inherit; font-size: 0.95rem; color: #150e24; background-color: #f8f9ff;
  transition: all 0.3s ease; outline: none; box-sizing: border-box;
}

input:focus, textarea:focus {
  border-color: #3f509e; background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(63, 80, 158, 0.1);
}

.author-dropdown-container { position: relative; }
.combobox-wrapper { position: relative; }
.arrow-icon, .clear-icon {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: #8a8fb9; font-size: 0.9rem;
}
.arrow-icon { pointer-events: none; }
.clear-icon { cursor: pointer; transition: color 0.2s; }
.clear-icon:hover { color: #fb2e86; }

.dropdown-list {
  position: absolute; top: 100%; left: 0; right: 0; background: white;
  border: 1px solid #dcdcdc; border-radius: 8px; margin-top: 4px; padding: 0.5rem 0;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); z-index: 100; max-height: 200px;
  overflow-y: auto; list-style: none;
}
.dropdown-list li {
  padding: 0.6rem 1rem; cursor: pointer; color: #4a405c; font-size: 0.95rem; transition: background 0.2s;
}
.dropdown-list li:hover { background-color: #f6f5ff; color: #3f509e; }
.dropdown-list .no-results { color: #8a8fb9; font-style: italic; cursor: default; padding: 0.6rem 1rem; }

.category-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.pill-label {
  padding: 0.5rem 1rem; background-color: #f0f2f8; color: #8a8fb9; border-radius: 20px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1px solid transparent;
  transition: all 0.2s; user-select: none;
}
.pill-label.active {
  background-color: #3f509e; color: #ffffff; box-shadow: 0 4px 10px rgba(63, 80, 158, 0.2);
}
.pill-label.active.tag.active { background: #8b5ed9 !important; }

.image-dropzone {
  border: 2px dashed #dcdcdc; border-radius: 12px; background-color: #f8f9ff;
  transition: all 0.2s ease; position: relative; min-height: 140px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.image-dropzone.is-dragging { border-color: #3f509e; background-color: #f0f2f8; }
.image-dropzone.has-image { border-style: solid; border-color: #eae8f5; background: #000; }
.hidden-input { display: none; }

.upload-content { text-align: center; cursor: pointer; padding: 2rem; width: 100%; }
.drop-icon { font-size: 2rem; color: #3f509e; margin-bottom: 0.5rem; }
.upload-content p { color: #150e24; font-size: 0.95rem; margin: 0; }
.upload-content span { color: #8a8fb9; font-size: 0.8rem; }

.image-preview-container { width: 100%; height: 200px; position: relative; }
.preview-img { width: 100%; height: 100%; object-fit: contain; }
.preview-overlay {
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex;
  align-items: center; justify-content: center; gap: 1rem; opacity: 0; transition: opacity 0.2s;
}
.image-preview-container:hover .preview-overlay { opacity: 1; }

.replace-btn, .remove-btn-overlay {
  border: none; padding: 0.6rem 1rem; border-radius: 6px; font-weight: 600;
  font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px;
}
.replace-btn { background: #ffffff; color: #151875; }
.remove-btn-overlay { background: #e03a5b; color: white; }

.checkbox-card {
  display: flex; align-items: flex-start; gap: 1rem; padding: 1.2rem;
  background: #fbfbfe; border: 1.5px solid #eae8f5; border-radius: 12px;
  cursor: pointer; transition: all 0.2s ease; margin-bottom: 0;
  flex-direction: row !important; margin-top: 0.5rem;
}

.checkbox-card:hover { border-color: #dcd9ef; }

.checkbox-wrapper { position: relative; width: 22px; height: 22px; margin-top: 2px; }
.checkbox-wrapper input { opacity: 0; width: 0; height: 0; position: absolute; }
.checkbox-custom {
  position: absolute; top: 0; left: 0; height: 22px; width: 22px;
  background-color: #ffffff; border: 1.5px solid #dcd9ef; border-radius: 6px;
  transition: all 0.2s ease; display: flex; justify-content: center; align-items: center;
}

.checkbox-wrapper input:checked ~ .checkbox-custom {
  background-color: #3f509e; border-color: #3f509e;
}

.checkbox-wrapper input:checked ~ .checkbox-custom::after {
  content: ""; display: block; width: 5px; height: 10px;
  border: solid white; border-width: 0 2px 2px 0;
  transform: rotate(45deg); margin-bottom: 2px;
}

.checkbox-label { cursor: pointer; margin: 0; display: flex; flex-direction: column; }
.checkbox-label .title { font-weight: 600; color: #150e24; font-size: 0.95rem; margin-bottom: 0.15rem; }
.checkbox-label .desc { font-weight: 400; color: #8a8fb9; font-size: 0.8rem; }

.modal-footer {
  padding: 1rem 1.5rem; background-color: #fbfbfe; border-top: 1px solid #eae8f5;
  display: flex; justify-content: flex-end; gap: 1rem;
}

.btn-primary {
  background-color: #3f509e; color: #ffffff; border: none; padding: 0.8rem 1.6rem;
  border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { background-color: #2e3b75; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-text {
  background: transparent; color: #8a8fb9; border: none; font-weight: 600;
  cursor: pointer; padding: 0.8rem 1.2rem; border-radius: 8px;
}
.btn-text:hover { color: #151875; background-color: #f6f5ff; }

.loading-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem 0; color: #3f509e; font-weight: 600;
}
.loader-circle {
  border: 3px solid #f6f5ff; border-top: 3px solid #3f509e; border-radius: 50%;
  width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom: 1rem;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>