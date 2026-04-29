<script setup>
import { ref, onMounted, computed } from "vue"
import api from "@/services/axios.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"

const products = ref([])
const categories = ref([])
const tags = ref([])

const isLoading = ref(false)
const fetchError = ref(null)

const selectedCategories = ref([])
const selectedTags = ref([])
const priceMin = ref(null)
const priceMax = ref(null)
const authorQuery = ref("")

const sortBy = ref("default")

const loadData = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      api.get("categories"),
      api.get("products"),
    ])

    categories.value = categoriesResponse.data
    products.value = productsResponse.data
    console.log("Fetched products:", products.value)

    const uniqueTags = new Map()
    products.value.forEach((product) => {
      product.tagi.forEach((tag) => {
        if (!uniqueTags.has(tag.idTagu)) {
          uniqueTags.set(tag.idTagu, tag)
        }
      })
    })
    tags.value = Array.from(uniqueTags.values())
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

// --- LOGIKA FILTROWANIA ---
const filteredProducts = computed(() => {
  // 1. Filtrowanie
  let result = products.value.filter((product) => {
    if (selectedCategories.value.length > 0) {
      const hasCategory = product.kategorie.some((c) =>
        selectedCategories.value.includes(c.idKategorii),
      )
      if (!hasCategory) return false
    }

    if (selectedTags.value.length > 0) {
      const hasTag = product.tagi.some((t) =>
        selectedTags.value.includes(t.idTagu),
      )
      if (!hasTag) return false
    }

    if (priceMin.value !== null && priceMin.value !== "") {
      if (product.cena < parseFloat(priceMin.value)) return false
    }

    if (priceMax.value !== null && priceMax.value !== "") {
      if (product.cena > parseFloat(priceMax.value)) return false
    }

    if (authorQuery.value.trim() !== "") {
      const fullName =
        `${product.autorImie} ${product.autorNazwisko}`.toLowerCase()
      if (!fullName.includes(authorQuery.value.toLowerCase().trim()))
        return false
    }

    return true
  })

  // 2. Sortowanie wyniku
  if (sortBy.value === "price-asc") {
    result.sort((a, b) => a.cena - b.cena)
  } else if (sortBy.value === "price-desc") {
    result.sort((a, b) => b.cena - a.cena)
  }

  return result
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <main class="shop-page">
    <div class="shop-toolbar container">
      <div class="toolbar-left">
        <h1 class="page-title">Product Catalog</h1>
        <p class="results-count" v-if="!isLoading && !fetchError">
          Showing <strong>{{ filteredProducts.length }}</strong> results
        </p>
      </div>
      <div class="toolbar-right">
        <div class="sort-box">
          <label>Sort by:</label>
          <select class="sort-select" v-model="sortBy">
            <option value="default">Best Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="status-message loading container">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading catalog...
    </div>

    <ErrorCard
      v-else-if="fetchError"
      :message="fetchError.message"
      @retry="loadData"
    />

    <div v-else class="shop-layout container">
      <aside class="filters-sidebar">
        <div class="filter-card">
          <h3 class="filter-title">Categories</h3>
          <div class="filter-options">
            <label
              class="custom-checkbox"
              v-for="cat in categories"
              :key="cat.idKategorii"
            >
              <input
                type="checkbox"
                :value="cat.idKategorii"
                v-model="selectedCategories"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ cat.nazwaKategorii }}</span>
            </label>
          </div>
        </div>

        <div class="filter-card" v-if="tags.length > 0">
          <h3 class="filter-title">Tags</h3>
          <div class="filter-options">
            <label
              class="custom-checkbox"
              v-for="tag in tags"
              :key="tag.idTagu"
            >
              <input
                type="checkbox"
                :value="tag.idTagu"
                v-model="selectedTags"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ tag.nazwaTagu }}</span>
            </label>
          </div>
        </div>

        <div class="filter-card">
          <h3 class="filter-title">Price Range</h3>
          <div class="price-inputs">
            <div class="input-wrapper">
              <span class="currency">PLN</span>
              <input
                type="number"
                placeholder="Min"
                v-model="priceMin"
                class="filter-input"
                min="0"
              />
            </div>
            <span class="price-separator">-</span>
            <div class="input-wrapper">
              <span class="currency">PLN</span>
              <input
                type="number"
                placeholder="Max"
                v-model="priceMax"
                class="filter-input"
                min="0"
              />
            </div>
          </div>
        </div>

        <div class="filter-card">
          <h3 class="filter-title">Author</h3>
          <div class="search-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search author..."
              v-model="authorQuery"
              class="filter-input full-width with-icon"
            />
          </div>
        </div>
      </aside>

      <section class="products-list">
        <div v-if="filteredProducts.length === 0" class="no-results">
          <div class="no-results-icon">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <h3>No products match your criteria</h3>
          <p>Try clearing some filters or searching for something else.</p>
          <button
            class="clear-filters-btn"
            @click="
              () => {
                selectedCategories = []
                selectedTags = []
                priceMin = null
                priceMax = null
                authorQuery = ''
              }
            "
          >
            Clear all filters
          </button>
        </div>

        <div
          class="product-card"
          v-for="item in filteredProducts"
          :key="item.idProduktu"
        >
          <div class="product-image-box">
            <router-link
              :to="`/products/${item.idProduktu}`"
              class="image-link"
            >
              <i class="fa-regular fa-image"></i>
            </router-link>
          </div>

          <div class="product-info">
            <div class="product-header">
              <div class="title-wrap">
                <h2 class="product-name">
                  <router-link
                    :to="`/products/${item.idProduktu}`"
                    class="product-title-link"
                  >
                    {{ item.nazwaProduktu }}
                  </router-link>
                </h2>
                <p class="product-author">
                  By
                  <strong>{{ item.autorImie }} {{ item.autorNazwisko }}</strong>
                  <span class="dot-separator" v-if="item.dataWydania">•</span>
                  <span class="publish-date" v-if="item.dataWydania">{{
                    item.dataWydania
                  }}</span>
                </p>
              </div>
              <div class="price-wrap">
                <span class="current-price"
                  >{{ item.cena.toFixed(2) }} <small>PLN</small></span
                >
              </div>
            </div>

            <div class="product-tags">
              <span class="tag" v-for="tag in item.tagi" :key="tag.idTagu">
                {{ tag.nazwaTagu }}
              </span>
            </div>

            <p class="product-description">
              {{
                item.opis
                  ? item.opis
                  : "Experience the magic of this incredible piece. Detailed description coming soon, but we promise it's worth it."
              }}
            </p>

            <div class="product-actions">
              <button class="action-btn cart-btn">
                <i class="fa-solid fa-cart-shopping"></i> Add to Cart
              </button>
              <div class="secondary-actions">
                <button class="icon-btn" title="Add to Wishlist">
                  <i class="fa-regular fa-heart"></i>
                </button>
                <router-link :to="`/products/${item.idProduktu}`">
                  <button class="icon-btn" title="Show the Product">
                    <i class="fa-solid fa-expand"></i>
                  </button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.shop-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fbfbfe;
  color: #150e24;
  padding: 10rem 0 13rem 0;
}

.container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.shop-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eae8f5;
}

.page-title {
  color: #151875;
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.results-count {
  color: #8a8fb9;
  font-size: 1rem;
  margin: 0;
}

.results-count strong {
  color: #151875;
  font-weight: 600;
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #4a405c;
  font-weight: 500;
}

.sort-select {
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background-color: #ffffff;
  outline: none;
  color: #150e24;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23151875%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;
}

.status-message.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #7d4cd4;
  padding: 5rem 0;
}

.no-results {
  text-align: center;
  padding: 5rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #eae8f5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.no-results-icon {
  width: 80px;
  height: 80px;
  background-color: #f3f0ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.no-results-icon i {
  font-size: 2.5rem;
  color: #7d4cd4;
}

.no-results h3 {
  color: #151875;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.no-results p {
  color: #8a8fb9;
  margin-bottom: 2rem;
}

.clear-filters-btn {
  background-color: #3f509e;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-filters-btn:hover {
  background-color: #2e3b75;
}

.shop-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3.5rem;
  align-items: start;
}

.filters-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid #eae8f5;
}

.filter-title {
  color: #3f509e;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700; /* Złagodzono z 800 */
  margin: 0 0 1.2rem 0;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  color: #4a405c;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.custom-checkbox:hover {
  color: #3f509e;
}

.custom-checkbox input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border: 2px solid #dcdcdc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #3f509e;
  border-color: #3f509e;
}

.custom-checkbox input:checked ~ .checkmark::after {
  content: "\f00c";
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  color: white;
  font-size: 11px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.currency {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: #8a8fb9;
  pointer-events: none;
}

.filter-input {
  width: 100%;
  padding: 0.7rem 0.7rem 0.7rem 2.2rem;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  outline: none;
  font-family: inherit;
  color: #150e24;
  font-weight: 500;
  transition: border-color 0.3s ease;
}

.filter-input:focus {
  border-color: #7d4cd4;
}

.price-separator {
  color: #8a8fb9;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a8fb9;
}

.filter-input.with-icon {
  padding-left: 2.5rem;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
  border: 1px solid #eae8f5;
  padding: 1.5rem;
  gap: 2rem;
}

.product-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  transform: translateY(-3px);
  border-color: #d5ccf8;
}

.product-image-box {
  width: 220px;
  height: 220px;
  background-color: #f8f9fc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dcdcdc;
  font-size: 4rem;
  flex-shrink: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.product-name {
  color: #151875;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
}

.product-author {
  color: #8a8fb9;
  font-size: 0.95rem;
  margin: 0;
}

.product-author strong {
  color: #150e24;
  font-weight: 500;
}

.dot-separator {
  margin: 0 0.5rem;
  color: #dcdcdc;
}

.current-price {
  color: #151875;
  font-size: 1.4rem;
  font-weight: 700;
}

.current-price small {
  font-size: 0.9rem;
  color: #8a8fb9;
  font-weight: 500;
}

.product-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: #f3f0ff;
  color: #7d4cd4;
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-description {
  color: #4a405c;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.cart-btn {
  background-color: #3f509e;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.cart-btn:hover {
  background-color: #2e3b75;
  transform: translateY(-2px);
}

.secondary-actions {
  display: flex;
  gap: 0.8rem;
}

.icon-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #3f509e;
  border: 1px solid #eae8f5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: #2e3b75;
}

.product-title-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s ease;
}

.product-title-link:hover {
  color: #7d4cd4;
}

.image-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;
}

@media (max-width: 1024px) {
  .shop-layout {
    grid-template-columns: 240px 1fr;
    gap: 2rem;
  }
}

@media (max-width: 850px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 650px) {
  .product-card {
    flex-direction: column;
    padding: 1.2rem;
    gap: 1rem;
  }

  .product-image-box {
    width: 100%;
    height: 250px;
  }

  .product-header {
    flex-direction: column;
    gap: 0.8rem;
  }

  .price-wrap {
    margin-top: 0.5rem;
  }

  .shop-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>
