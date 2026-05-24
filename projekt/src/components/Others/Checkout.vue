<script setup>
import { ref, onMounted, computed, watch } from "vue"
import api from "@/services/axios.js"
import { cartItems, cartSum, clearCart } from "@/components/Others/cartLogic"
import DeliverySelection from "./DeliverySelection.vue"
const isLoggedIn = localStorage.getItem("token") != null

const props = defineProps({
  show: Boolean,
  prefilledAddress: {
    type: Object,
    default: () => ({
      miasto: "",
      ulica: "",
      numerBudynku: "",
      numerLokalu: "",
      kodPocztowy: "",
    }),
  },
  selectedDelivery: {
    type: Object,
    default: {
      id: 0,
      name: "",
      price: 0.0,
      icon: "fa-solid fa-truck",
    },
    required: true,
  },
})
const emit = defineEmits(["close", "order-placed", "update:selectedDelivery"])

const isLoading = ref(false)
const isSubmitting = ref(false)
const placedOrderFlag = ref(false)

const shippingCost = ref(15)

const checkoutForm = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  buildingNo: "",
  aptNo: "",
  postalCode: "",
  city: "",
})

const selectedDelivery = computed({
  get: () => props.selectedDelivery,
  set: (val) => emit("update:selectedDelivery", val),
})
const isLocalDelivery = ref(false)
const test = () => {
  console.log(selectedDelivery)
  console.log(props.selectedDelivery)

  console.log(isLocalDelivery)
}

const hasFirstName = ref(false)
const hasLastName = ref(false)
const hasEmail = ref(false)
const hasPhone = ref(false)
const hasAddress = ref(false)

const calculateCheckoutShipping = () => {
  if (cartItems == null || cartItems.value.length < 1) {
    shippingCost.value = 0
    return
  }

  let currentCost = selectedDelivery.value.price || 0

  for (const item of cartItems.value) {
    if (item.product && item.product.kategorie) {
      const isBook = item.product.kategorie.some((kategoria) => {
        const nazwaKategorii = kategoria.nazwaKategorii || kategoria.nazwa || ""
        return (
          nazwaKategorii.toLowerCase().includes("books") ||
          nazwaKategorii.toLowerCase().includes("book")
        )
      })

      if (isBook) {
        currentCost += 1.24 * (item.ilosc || 1)
      }
    }
  }
  shippingCost.value = currentCost
}

const isPostalCodeValid = computed(() => {
  return /^\d{2}-\d{3}$/.test(checkoutForm.value.postalCode)
})

const isFormInvalid = computed(() => {
  console.log(checkoutForm)
  return (
    !checkoutForm.value.firstName ||
    !checkoutForm.value.lastName ||
    !checkoutForm.value.email ||
    !checkoutForm.value.phone ||
    !checkoutForm.value.street ||
    !checkoutForm.value.buildingNo ||
    !isPostalCodeValid.value ||
    !checkoutForm.value.city
  )
})

const totalOrderSum = computed(() => {
  return (cartSum.value + shippingCost.value).toFixed(2)
})

const loadUserProfile = async () => {
  if (!isLoggedIn) return
  isLoading.value = true
  try {
    const response = await api.get("users/me")
    const profile = response.data

    if (profile.imie) {
      checkoutForm.value.firstName = profile.imie
      hasFirstName.value = true
    }
    if (profile.nazwisko) {
      checkoutForm.value.lastName = profile.nazwisko
      hasLastName.value = true
    }
    if (profile.email) {
      checkoutForm.value.email = profile.email
      hasEmail.value = true
    }

    const dbPhone =
      profile.telefon || profile.numerTelefonu || profile.phoneNumber
    if (dbPhone) {
      checkoutForm.value.phone = dbPhone
      hasPhone.value = true
    }
  } catch (error) {
    console.warn("Could not fetch user profile, proceeding with manual input.")
  } finally {
    isLoading.value = false
  }
}

const verifyAndSetAddress = () => {
  const addr = props.prefilledAddress
  if (addr && addr.ulica && addr.miasto && addr.kodPocztowy) {
    checkoutForm.value.street = addr.ulica
    checkoutForm.value.buildingNo = addr.numerBudynku
    checkoutForm.value.aptNo = addr.numerLokalu || ""
    checkoutForm.value.postalCode = addr.kodPocztowy
    checkoutForm.value.city = addr.miasto
    hasAddress.value = true
  } else {
    hasAddress.value = false
  }
}

const handlePlaceOrder = async () => {
  placedOrderFlag.value = true
  if (isFormInvalid.value) {
    console.warn("fill in all highlighted fields before proceeding")
    return
  }

  isSubmitting.value = true
  try {
    const orderPayload = {
      imie: checkoutForm.value.firstName,
      nazwisko: checkoutForm.value.lastName,
      email: checkoutForm.value.email,
      telefon: checkoutForm.value.phone,

      adresDostawy: {
        ulica: checkoutForm.value.street,
        numerBudynku: checkoutForm.value.buildingNo,
        numerLokalu: checkoutForm.value.aptNo || null,
        kodPocztowy: checkoutForm.value.postalCode,
        miasto: checkoutForm.value.city,
      },

      produkty: cartItems.value.map((item) => ({
        idProduktu: item.idProduktu,
        ilosc: item.ilosc,
        cenaCząstkowa: item.product?.cena || 0,
      })),
      kosztWysylki: shippingCost.value,
      sumaCalkowita: parseFloat(totalOrderSum.value),
    }
    console.log(orderPayload)

    showAlert({ type: "success", message: "Order placed successfully!" })
    clearCart()
    emit("order-placed")
    emit("close")
  } catch (error) {
    console.error("Order error:", error)
  } finally {
    isSubmitting.value = false
  }
}
watch(
  [() => props.show, () => props.prefilledAddress],
  ([isShown, address]) => {
    if (isShown) {
      verifyAndSetAddress()
      calculateCheckoutShipping()
    }
  },
  { deep: true, immediate: true },
)

watch(
  selectedDelivery,
  (selectedDelivery) => {
    calculateCheckoutShipping()
  },
  { deep: true, immediate: true },
)
onMounted(() => {
  loadUserProfile()
  verifyAndSetAddress()
  calculateCheckoutShipping()
})
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click.self="emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Proceed to Checkout</h2>
          <button
            class="close-btn"
            @click="emit('close')"
            :disabled="isSubmitting"
          >
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div v-if="isLoading" class="loading-state text-center py-4">
            <p>Loading checkout data...</p>
          </div>

          <div v-else class="checkout-flow-form">
            <div class="checkout-section mb-4">
              <h3 class="section-subtitle">1. Personal Information</h3>
              <p class="section-hint mb-3">
                Required for order verification and notification.
              </p>

              <div class="row-fields mb-2">
                <div class="form-group flex-1">
                  <label class="form-label"
                    >First Name <span class="required">*</span></label
                  >
                  <input
                    type="text"
                    v-model="checkoutForm.firstName"
                    class="form-control"
                    :class="{
                      'input-error': placedOrderFlag && !checkoutForm.firstName,
                    }"
                    placeholder="Enter first name"
                    :disabled="hasFirstName || isSubmitting"
                  />
                  <span
                    v-if="placedOrderFlag && !checkoutForm.firstName"
                    class="error-text"
                    >First name is required</span
                  >
                </div>
                <div class="form-group flex-1">
                  <label class="form-label"
                    >Last Name <span class="required">*</span></label
                  >
                  <input
                    type="text"
                    v-model="checkoutForm.lastName"
                    class="form-control"
                    :class="{
                      'input-error': placedOrderFlag && !checkoutForm.lastName,
                    }"
                    placeholder="Enter last name"
                    :disabled="hasLastName || isSubmitting"
                  />
                  <span
                    v-if="placedOrderFlag && !checkoutForm.lastName"
                    class="error-text"
                    >Last name is required</span
                  >
                </div>
              </div>

              <div class="row-fields mb-2">
                <div class="form-group flex-1">
                  <label class="form-label"
                    >Email Address <span class="required">*</span></label
                  >
                  <input
                    type="email"
                    v-model="checkoutForm.email"
                    class="form-control"
                    :class="{
                      'input-error': placedOrderFlag && !checkoutForm.email,
                    }"
                    placeholder="name@example.com"
                  />
                  <span
                    v-if="placedOrderFlag && !checkoutForm.email"
                    class="error-text"
                    >Email is required</span
                  >
                </div>
                <div class="form-group flex-1">
                  <label class="form-label"
                    >Phone Number <span class="required">*</span></label
                  >
                  <input
                    type="tel"
                    v-model="checkoutForm.phone"
                    class="form-control"
                    :class="{
                      'input-error': placedOrderFlag && !checkoutForm.phone,
                    }"
                    placeholder="e.g. +48 123 456 789"
                  />
                  <span
                    v-if="placedOrderFlag && !checkoutForm.phone"
                    class="error-text"
                    >Phone number is required</span
                  >
                </div>
              </div>
            </div>
            <div class="checkout-section mb-4">
              <h3 class="section-subtitle">2. delivery Method</h3>
              <button v-on:click="test">test</button>
              <DeliverySelection
                v-model="selectedDelivery"
                v-model:is-local-delivery="isLocalDelivery"
                variant="grid"
              />
            </div>
            <div class="checkout-section mb-4">
              <h3 class="section-subtitle">3. Shipping Address</h3>
              <p v-if="hasAddress" class="section-hint success-hint mb-3">
                ✓ Using address selected during delivery cost calculation.
              </p>

              <p v-else class="section-hint mb-3">
                Please fill in your delivery details below.
              </p>

              <div class="form-group mb-2">
                <label class="form-label"
                  >Street <span class="required">*</span></label
                >
                <input
                  type="text"
                  v-model="checkoutForm.street"
                  class="form-control"
                  :class="{
                    'input-error': placedOrderFlag && !checkoutForm.street,
                  }"
                  placeholder="Street name"
                />
                <span
                  v-if="placedOrderFlag && !checkoutForm.street"
                  class="error-text"
                  >Street name is required</span
                >
              </div>

              <div class="row-fields mb-2">
                <div class="form-group flex-1">
                  <label class="form-label"
                    >Building No. <span class="required">*</span></label
                  >
                  <input
                    type="text"
                    v-model="checkoutForm.buildingNo"
                    class="form-control"
                    :class="{
                      'input-error':
                        placedOrderFlag && !checkoutForm.buildingNo,
                    }"
                    placeholder="e.g. 12A"
                  />
                  <span
                    v-if="placedOrderFlag && !checkoutForm.buildingNo"
                    class="error-text"
                    >Required</span
                  >
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Apt No.</label>
                  <input
                    type="text"
                    v-model="checkoutForm.aptNo"
                    class="form-control"
                    placeholder="e.g. 4 (optional)"
                  />
                </div>
              </div>

              <div class="row-fields mb-2">
                <div class="form-group flex-1">
                  <label class="form-label"
                    >Postal Code <span class="required">*</span></label
                  >
                  <input
                    type="text"
                    v-model="checkoutForm.postalCode"
                    class="form-control"
                    :class="{
                      'input-error': placedOrderFlag && !isPostalCodeValid,
                    }"
                    placeholder="00-000"
                  />
                  <span
                    v-if="placedOrderFlag && !checkoutForm.postalCode"
                    class="error-text"
                  >
                    Postal code is required.
                  </span>
                  <span
                    v-else-if="placedOrderFlag && !isPostalCodeValid"
                    class="error-text"
                  >
                    Postal code must be in 00-000 format.
                  </span>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label"
                    >City <span class="required">*</span></label
                  >
                  <input
                    type="text"
                    v-model="checkoutForm.city"
                    class="form-control"
                    :class="{
                      'input-error': placedOrderFlag && !checkoutForm.city,
                    }"
                    placeholder="City name"
                  />
                  <span
                    v-if="placedOrderFlag && !checkoutForm.city"
                    class="error-text"
                    >City name is required</span
                  >
                </div>
              </div>
            </div>

            <div class="order-summary-box p-3 mb-2">
              <h4 class="summary-title mb-2">Order Summary</h4>
              <div class="summary-line">
                <span>Items Subtotal:</span>
                <span class="fw-bold">PLN {{ cartSum.toFixed(2) }}</span>
              </div>
              <div class="summary-line">
                <span>Shipping Cost:</span>
                <span>PLN {{ shippingCost.toFixed(2) }}</span>
              </div>
              <hr class="summary-divider" />
              <div class="summary-line total-line">
                <span>Total to Pay:</span>
                <span class="total-price">PLN {{ totalOrderSum }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn-secondary"
            @click="emit('close')"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            class="btn-primary"
            @click="handlePlaceOrder"
            :disabled="isLoading || isSubmitting"
          >
            {{ isSubmitting ? "Processing..." : "Place Order & Pay" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(74, 64, 92, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background-color: #fbfbfe;
  border-bottom: 1px solid #eae8f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.4rem;
  color: #151875;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #8a8fb9;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #151875;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  background-color: #ffffff;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #151875;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.section-hint {
  font-size: 0.85rem;
  color: #8a8fb9;
  margin: 0;
}

.success-hint {
  color: #2e7d32;
  font-weight: 500;
}

.row-fields {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a405c;
  margin-bottom: 0.4rem;
}

.required {
  color: #e03a5b;
}

.form-control {
  padding: 0.65rem 0.85rem;
  border: 1px solid #eae8f5;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #151875;
  background-color: #fbfbfe;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3f509e;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(63, 80, 158, 0.1);
}

/* NOWE STYLE DLA PODŚWIETLANIA BŁĘDÓW FORMULARZA */
.form-control.input-error {
  border-color: #e03a5b !important;
  background-color: #fdf2f4 !important;
}

.form-control.input-error:focus {
  box-shadow: 0 0 0 3px rgba(224, 58, 91, 0.15) !important;
}

.error-text {
  font-size: 0.75rem;
  color: #e03a5b;
  margin-top: 0.25rem;
  font-weight: 500;
}

.form-control:disabled {
  background-color: #f1eff8;
  color: #8a8fb9;
  cursor: not-allowed;
  border-color: #e1dde6;
}

/* Karta podsumowania */
.order-summary-box {
  background-color: #f8f8fd;
  border: 1px dashed #c2c6e2;
  border-radius: 12px;
}

.summary-title {
  font-size: 1rem;
  color: #151875;
  font-weight: 700;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #4a405c;
  margin-bottom: 0.4rem;
}

.summary-divider {
  border: 0;
  border-top: 1px solid #eae8f5;
  margin: 0.6rem 0;
}

.total-line {
  font-size: 1.05rem;
  font-weight: 700;
  color: #151875;
}

.total-price {
  color: #fb2e86;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background-color: #fbfbfe;
  border-top: 1px solid #eae8f5;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #fb2e86;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e02473;
}

.btn-secondary {
  background-color: white;
  color: #4a405c;
  border: 1px solid #eae8f5;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f1eff8;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animacja  */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
