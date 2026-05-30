<script setup>
import { ref, computed, onMounted } from "vue"
import api from "@/services/axios.js"
import {
  cartItems,
  cartSum,
  clearCart,
  addressForm,
  isLocalDelivery,
  shippingCost,
  selectedDelivery,
} from "@/components/Cart/cartLogic"

const props = defineProps({
  show: Boolean,
})
const emit = defineEmits(["close", "order-placed", "back"])

const isLoggedIn = localStorage.getItem("token") != null
const isSubmitting = ref(false)
const selectedPayment = ref(null)
const placedOrderFlag = ref(false)

const addresses = ref([])

const blikCode = ref("")
const bankTransferDetails = ref({
  accountNumber: "PL 12 3456 7890 0000 0000 1234 5678",
  title: "ORDER-" + Math.floor(Math.random() * 1000000),
})
// const validatePayment = () => {
//   if (selectedPayment.value?.id === 1) return blikCode.value.length === 6
//   if (selectedPayment.value?.id === 2) return cardData.value.number.length > 12
//   return true
// }
const paymentMethods = [
  { id: 1, name: "BLIK", icon: "fa-solid fa-mobile-screen" },
  { id: 2, name: "Karta płatnicza", icon: "fa-regular fa-credit-card" },
  { id: 3, name: "Szybki przelew", icon: "fa-solid fa-building-columns" },
]

const totalOrderSum = computed(() => {
  return (cartSum.value + shippingCost.value).toFixed(2)
})

const selectPayment = (method) => {
  selectedPayment.value = method
}
const loadAddresses = async () => {
  if (!isLoggedIn) return

  try {
    const response = await api.get("users/addresses")
    addresses.value = response.data || []
  } catch (error) {
    console.error("Failed to fetch user addresses:", error)
  }
}

const findAddressId = () => {
  console.log(addresses.value)
  const found = addresses.value.find((addr) => {
    return (
      addr.ulica === addressForm.value.street &&
      addr.numerBudynku === addressForm.value.buildingNo &&
      addr.numerLokalu === addressForm.value.aptNo &&
      addr.kodPocztowy === addressForm.value.postalCode &&
      addr.miasto === addressForm.value.city
    )
  })
  console.log("found ")
  console.log(found)
  return found ? found.idAdresu : null
}
const handleFinalizeOrder = async () => {
  placedOrderFlag.value = true
  if (!selectedPayment.value) {
    return
  }
  const matchedId = findAddressId()
  isSubmitting.value = true
  try {
    const orderPayload = {
      idMetodyDostawy: selectedDelivery.value.id,
      idMetodyPlatnosci: selectedPayment.value.id,
      pozycje: cartItems.value.map((item) => ({
        idProduktu: item.idProduktu,
        ilosc: item.ilosc,
      })),
      deliveryCost: shippingCost.value,
      idAdresu: matchedId,
      nowyAdres:
        isLocalDelivery.value || matchedId
          ? null
          : {
              ulica: addressForm.value.street,
              numerBudynku: addressForm.value.buildingNo,
              numerLokalu: addressForm.value.aptNo || null,
              kodPocztowy: addressForm.value.postalCode,
              miasto: addressForm.value.city,
            },
      email: addressForm.value.email,
      imie: addressForm.value.firstName,
      nazwisko: addressForm.value.lastName,
      numerTelefonu: addressForm.value.phone,
    }

    console.log("Wysyłanie zamówienia:", orderPayload)
    if (isLoggedIn) await api.post("users/orders", orderPayload)
    else await api.post("users/orders/guest", orderPayload)

    clearCart()
    emit("order-placed")
    emit("close")
  } catch (error) {
    console.error("Order error:", error)
  } finally {
    isSubmitting.value = false
  }
}
onMounted(async () => {
  await loadAddresses()
})
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click.self="emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Summary & Payment</h2>
          <button
            class="close-btn"
            @click="emit('close')"
            :disabled="isSubmitting"
          >
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div class="checkout-flow-form">
            <div class="checkout-section mb-4">
              <h3 class="section-subtitle">Order Summary Details</h3>
              <div class="summary-box mt-3">
                <div class="summary-item">
                  <span class="label">Personal details:</span>
                  <span class="value"
                    >{{ addressForm.firstName }} {{ addressForm.lastName
                    }}<br />
                    {{ addressForm.email }}<br />
                    {{ addressForm.phone }}</span
                  >
                </div>
                <div class="summary-item mt-2">
                  <span class="label">Delivery method:</span>
                  <span class="value">{{ selectedDelivery?.name }}</span>
                </div>
                <div v-if="!isLocalDelivery" class="summary-item mt-2">
                  <span class="label">Delivery address:</span>
                  <span class="value"
                    >{{ addressForm.street }} {{ addressForm.buildingNo
                    }}{{ addressForm.aptNo ? "/" + addressForm.aptNo : "" }},
                    {{ addressForm.postalCode }} {{ addressForm.city }}</span
                  >
                </div>
              </div>
            </div>

            <div class="checkout-section mb-4">
              <h3 class="section-subtitle">Payment Method</h3>
              <p class="section-hint mb-3">
                Select how you would like to pay for your order.
              </p>

              <div class="payment-layout">
                <div
                  v-for="method in paymentMethods"
                  :key="method.id"
                  class="payment-card-option"
                  :class="{ active: selectedPayment?.id === method.id }"
                  @click="selectPayment(method)"
                >
                  <div
                    v-if="selectedPayment?.id === method.id"
                    class="checked-badge"
                  >
                    <i class="fa-solid fa-circle-check"></i>
                  </div>
                  <div class="payment-content-main">
                    <i :class="method.icon" class="payment-option-icon"></i>
                    <span class="payment-option-name">{{ method.name }}</span>
                  </div>
                </div>
              </div>
              <span
                v-if="placedOrderFlag && !selectedPayment"
                class="error-text mt-2"
                style="display: block"
              >
                Please select a payment method to continue.
              </span>
            </div>
            <div class="checkout-section mb-4">
              <h3 class="section-subtitle">Payment Method</h3>

              <div class="payment-layout"></div>

              <div v-if="selectedPayment" class="payment-details-box mt-3">
                <div v-if="selectedPayment.id === 1" class="form-group">
                  <label>Enter BLIK code</label>
                  <input
                    v-model="blikCode"
                    type="text"
                    maxlength="6"
                    placeholder="000 000"
                    class="input-field"
                  />
                </div>

                <div v-if="selectedPayment.id === 2" class="card-form">
                  <input placeholder="Card number" class="input-field mb-2" />
                  <div class="row-flex">
                    <input placeholder="MM/YY" class="input-field" />
                    <input placeholder="CVV" class="input-field" />
                  </div>
                </div>

                <div v-if="selectedPayment.id === 3" class="transfer-info">
                  <p>Please make a transfer to the following account:</p>
                  <div class="info-box">
                    <strong>Account:</strong>
                    {{ bankTransferDetails.accountNumber }}<br />
                    <strong>Title:</strong> {{ bankTransferDetails.title }}
                  </div>
                </div>
              </div>
            </div>

            <div class="order-summary-box p-3 mt-4 mb-2">
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
            @click="emit('back')"
            :disabled="isSubmitting"
          >
            Back
          </button>
          <button
            class="btn-primary"
            @click="handleFinalizeOrder"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Processing..." : "Pay & Complete Order" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mb-2 {
  margin-bottom: 0.75rem;
}
.mb-3 {
  margin-bottom: 1.25rem;
}
.mb-4 {
  margin-bottom: 2rem;
}
.mt-2 {
  margin-top: 0.75rem;
}
.mt-3 {
  margin-top: 1.25rem;
}
.mt-4 {
  margin-top: 2rem;
}
.p-3 {
  padding: 1.5rem;
}

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

.modal-body {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  background-color: #ffffff;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #151875;
  font-weight: 700;
  margin-bottom: 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #fbfbfe;
}

.section-hint {
  font-size: 0.9rem;
  color: #8a8fb9;
  margin: 0;
}

.summary-box {
  background: #fbfbfe;
  border: 1px solid #eae8f5;
  border-radius: 8px;
  padding: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
}

.summary-item .label {
  font-weight: 600;
  color: #4a405c;
  margin-bottom: 0.2rem;
}

.summary-item .value {
  color: #151875;
  line-height: 1.4;
}

.payment-layout {
  display: flex;
  flex-direction: row;
  gap: 12px;
}
.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  box-sizing: border-box;
}

.payment-details-box {
  background: #f8f9ff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eae8f5;
}

.row-flex {
  display: flex;
  gap: 10px;
}

.info-box {
  background: white;
  padding: 10px;
  border-left: 4px solid #3f509e;
  font-size: 0.9rem;
  color: #151875;
}

.card-form input {
  margin-bottom: 8px;
}
.payment-card-option {
  flex: 1;
  height: 90px;
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
}

.payment-card-option:hover {
  border-color: #3f509e;
  background-color: #f8f9ff;
}

.payment-card-option.active {
  border-color: #3f509e;
  background-color: #f6f5ff;
  box-shadow: 0 2px 8px rgba(63, 80, 158, 0.1);
}

.payment-content-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.payment-option-icon {
  font-size: 1.5rem;
  color: #3f509e;
}

.payment-option-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #151875;
}

.checked-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ffffff;
  color: #7e4cd4;
  border-radius: 50%;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-text {
  font-size: 0.85rem;
  color: #e03a5b;
  font-weight: 500;
}

.order-summary-box {
  background-color: #f8f8fd;
  border: 1px dashed #c2c6e2;
  border-radius: 12px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-line {
  font-size: 1.15rem;
  font-weight: 700;
  color: #151875;
  margin-bottom: 0;
}

.total-price {
  color: #fb2e86;
  font-size: 1.25rem;
}

.modal-footer {
  padding: 1.25rem 2rem;
  background-color: #fbfbfe;
  border-top: 1px solid #eae8f5;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  font-size: 1rem;
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

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

@media (max-width: 600px) {
  .modal-body {
    padding: 1.5rem;
  }
  .payment-layout {
    flex-direction: column;
  }
}
</style>
