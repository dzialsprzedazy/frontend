<script setup>
import { ref, computed, onMounted } from "vue"
import api from "@/services/axios.js"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import {
  cartItems,
  cartSum,
  clearCart,
  addressForm,
  isLocalDelivery,
  shippingCost,
  selectedDelivery,
  isLoggedIn,
} from "@/components/Cart/cartLogic"

const props = defineProps({
  show: Boolean,
  discountAmount: {
    type: Number,
    default: 0,
  },
})
const emit = defineEmits(["close", "order-placed", "back"])

const isSubmitting = ref(false)
const selectedPayment = ref(null)
const placedOrderFlag = ref(false)

const addresses = ref([])

const discountCode = ref("")
const discount = ref(null)
const appliedDiscount = ref(0)

const discountError = ref(false)
const isApplyingDiscount = ref(false)

const orderSuccess = ref(false)
const finalOrderItems = ref([])
const finalOrderTotal = ref(0)
const finalOrderId = ref("Pending")

const isDownloading = ref(false)

const blikCode = ref("")
const cardData = ref({ cardNumber: "", date: "", ccv: "" })
const bankTransferDetails = ref({
  accountNumber: "12 3456 7890 0000 0000 0000 0000",
  title: "ORDER #[order number]",
})

const isPaymentValid = () => {
  const isEmpty = (value) => value == null || value.trim() === ""

  if (selectedPayment.value?.id === 1)
    return (
      !isEmpty(blikCode.value) && blikCode.value.replace(/\s/g, "").length === 6
    )
  if (selectedPayment.value?.id === 2)
    return (
      !isEmpty(cardData.value.cardNumber) &&
      !isEmpty(cardData.value.date) &&
      !isEmpty(cardData.value.ccv) &&
      cardData.value.cardNumber.trim().replace(/\s/g, "").length == 12
    )
  return true
}

const paymentMethods = [
  { id: 1, name: "BLIK", icon: "fa-solid fa-mobile-screen" },
  { id: 2, name: "Credit Card", icon: "fa-regular fa-credit-card" },
  { id: 3, name: "Bank Transfer", icon: "fa-solid fa-building-columns" },
]

const totalOrderSum = computed(() => {
  const sum = cartSum.value + shippingCost.value - props.discountAmount
  const dis = discount.value
    ? sum * (discount.value.znizkaProcentowa / 100.0)
    : 0

  appliedDiscount.value = dis
  return Math.max(0, sum - dis).toFixed(2)
})

const selectPayment = (method) => {
  selectedPayment.value = method
}

const loadAddresses = async () => {
  if (!isLoggedIn.value) return

  try {
    const response = await api.get("users/addresses")
    addresses.value = response.data || []
  } catch (error) {
    console.error("Failed to fetch user addresses:", error)
  }
}

const applyDiscount = async () => {
  if (!discountCode.value.trim()) return

  isApplyingDiscount.value = true
  discountError.value = false

  try {
    const response = await api.get(
      `discountCodes/validate/${discountCode.value}`,
    )
    if (response.data) {
      discount.value = response.data
    } else {
      discountError.value = true
    }
  } catch (error) {
    console.error("Błąd podczas weryfikacji kodu:", error)
    discountError.value = true
    discount.value = null
  } finally {
    isApplyingDiscount.value = false
  }
}

const findAddressId = () => {
  const found = addresses.value.find((addr) => {
    return (
      addr.ulica === addressForm.value.street &&
      addr.numerBudynku === addressForm.value.buildingNo &&
      addr.numerLokalu === addressForm.value.aptNo &&
      addr.kodPocztowy === addressForm.value.postalCode &&
      addr.miasto === addressForm.value.city
    )
  })
  return found ? found.idAdresu : null
}

const handleFinalizeOrder = async () => {
  placedOrderFlag.value = true
  let paymentAmount = totalOrderSum.value

  if (!selectedPayment.value || !isPaymentValid()) {
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
      calkowitaKwota: paymentAmount,
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
      idKodu: discount.value ? discount.value.idKodu : null,
    }
    let response
    if (isLoggedIn.value)
      response = await api.post("users/orders", orderPayload)
    else response = await api.post("users/orders/guest", orderPayload)
    
    finalOrderItems.value = [...cartItems.value]
    finalOrderTotal.value = paymentAmount
    finalOrderId.value = response?.data?.idZamowienia || "N/A"

    if (selectedPayment.value.id === 3) {
      bankTransferDetails.value.title = `ORDER #${finalOrderId.value}`
    }
    clearCart()
    emit("order-placed")
    orderSuccess.value = true
  } catch (error) {
    console.error("Order error:", error)
  } finally {
    isSubmitting.value = false
  }
}

const downloadInvoice = async () => {
  if (isDownloading.value) return
  isDownloading.value = true

  try {
    const doc = new jsPDF()

    try {
      const fontUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf"
      const response = await fetch(fontUrl)
      const fontBuffer = await response.arrayBuffer()
      
      let binary = ''
      const bytes = new Uint8Array(fontBuffer)
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const fontBase64 = window.btoa(binary)
      
      doc.addFileToVFS('Roboto-Regular.ttf', fontBase64)
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
      doc.setFont('Roboto')
    } catch (fontError) {
      console.warn("Failed to load Polish font for PDF.", fontError)
    }

    const colDarkBlue = [21, 24, 117]
    const colPink = [251, 46, 134]
    const colGrayText = [138, 143, 185]
    const colLightBg = [251, 251, 254]

    doc.setFontSize(26)
    doc.setTextColor(...colDarkBlue)
    doc.text("INVOICE", 14, 25)
    
    doc.setDrawColor(...colPink)
    doc.setLineWidth(1.5)
    doc.line(14, 28, 45, 28)

    doc.setFontSize(10)
    doc.setTextColor(...colGrayText)
    doc.text(`Invoice Number: INV/${new Date().getFullYear()}/${finalOrderId.value}`, 125, 20)
    doc.text(`Issue Date: ${new Date().toLocaleDateString('en-GB')}`, 125, 26)

    doc.setFillColor(...colLightBg)
    doc.roundedRect(14, 40, 85, 45, 3, 3, 'F')
    doc.roundedRect(110, 40, 85, 45, 3, 3, 'F')

    doc.setFontSize(11)
    doc.setTextColor(...colDarkBlue)
    doc.text("Seller:", 18, 48)
    doc.setFontSize(10)
    doc.setTextColor(80)
    doc.text("Sklep Kotika", 18, 55)
    doc.text("Stefana Banacha 22, Lodz, Poland", 18, 60)
    doc.text("Tel: +48 591 182 321", 18, 65)
    doc.text("Email: shop@kotika.com", 18, 70)
    doc.text("90-238 Lodz", 18, 75)
    doc.text("NIP: 1234567890", 18, 80)

    doc.setFontSize(11)
    doc.setTextColor(...colDarkBlue)
    doc.text("Buyer:", 114, 48)
    doc.setFontSize(10)
    doc.setTextColor(80)
    doc.text(`${addressForm.value.firstName} ${addressForm.value.lastName}`, 114, 55)
    const apt = addressForm.value.aptNo ? `/${addressForm.value.aptNo}` : ''
    doc.text(`${addressForm.value.street} ${addressForm.value.buildingNo}${apt}`, 114, 60)
    doc.text(`${addressForm.value.postalCode} ${addressForm.value.city}`, 114, 65)
    doc.text(`Tel: ${addressForm.value.phone}`, 114, 70)
    doc.text(`Email: ${addressForm.value.email}`, 114, 75)

    doc.setFillColor(...colLightBg)
    doc.roundedRect(14, 90, 181, 22, 3, 3, 'F')

    doc.setFontSize(10)
    doc.setTextColor(...colDarkBlue)
    doc.text("Payment & Delivery Details:", 18, 98)
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text(`Payment Method: ${selectedPayment.value?.name || "Not selected"}`, 18, 105)
    doc.text(`Delivery Method: ${selectedDelivery.value?.name || "Not selected"}`, 114, 105)

    const tableData = finalOrderItems.value.map((item, index) => [
      index + 1,
      item.product.nazwaProduktu || "Product",
      item.ilosc,
      `${(item.product.cenaPoPromocji || 0).toFixed(2)} PLN`,
      `${(item.ilosc * (item.product.cenaPoPromocji || 0)).toFixed(2)} PLN`
    ])

    if (shippingCost.value > 0) {
      tableData.push([
        '',
        `Delivery: ${selectedDelivery.value?.name || "Shipping cost"}`,
        '1',
        `${shippingCost.value.toFixed(2)} PLN`,
        `${shippingCost.value.toFixed(2)} PLN`
      ])
    }

    if (appliedDiscount.value > 0) {
      tableData.push([
        '',
        `Applied discount ${discount.value ? '('+discount.value.znizkaProcentowa+'%)' : ''}`,
        '1',
        `-${appliedDiscount.value.toFixed(2)} PLN`,
        `-${appliedDiscount.value.toFixed(2)} PLN`
      ])
    }

    autoTable(doc, {
      startY: 120,
      head: [['No.', 'Product Name', 'Quantity', 'Unit Price', 'Total Price']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'Roboto',
        fontSize: 10,
        cellPadding: 6,
        lineColor: [234, 232, 245],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: colDarkBlue,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 35 }
      },
      alternateRowStyles: {
        fillColor: colLightBg
      }
    })

    const finalY = doc.lastAutoTable.finalY || 120

    doc.setDrawColor(194, 198, 226)
    doc.setLineDash([2, 2], 0)
    doc.line(135, finalY + 10, 196, finalY + 10)
    doc.setLineDash([], 0)

    doc.setFontSize(12)
    doc.setTextColor(...colDarkBlue)
    doc.text(`Total Paid:`, 135, finalY + 20)
    
    doc.setFontSize(14)
    doc.setTextColor(...colPink)
    doc.text(`${finalOrderTotal.value} PLN`, 196, finalY + 20, { align: 'right' })

    doc.setFontSize(9)
    doc.setTextColor(...colGrayText)
    doc.text("Document generated electronically. Thank you for shopping at Kotika store!", 105, 280, { align: 'center' })

    doc.save(`Invoice_${finalOrderId.value}.pdf`)
  } catch (err) {
    console.error("Invoice generation error:", err)
  } finally {
    isDownloading.value = false
  }
}

const closeSuccessModal = () => {
  emit("close")
  setTimeout(() => {
    orderSuccess.value = false
    selectedPayment.value = null
    placedOrderFlag.value = false
  }, 300)
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
          <h2>
            {{
              orderSuccess ? "Order Placed Successfully!" : "Summary & Payment"
            }}
          </h2>
          <button
            class="close-btn"
            @click="orderSuccess ? closeSuccessModal() : emit('close')"
            :disabled="isSubmitting"
          >
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div v-if="!orderSuccess" class="checkout-flow-form">
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
                <div class="summary-item mt-3">
                  <span class="label">Delivery method:</span>
                  <span class="value">{{ selectedDelivery?.name }}</span>
                </div>
                <div v-if="!isLocalDelivery" class="summary-item mt-3">
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
              <div v-if="selectedPayment" class="payment-details-box mt-3">
                <div v-if="selectedPayment.id === 1" class="form-group">
                  <label>Enter BLIK code</label>
                  <input
                    v-model="blikCode"
                    type="text"
                    maxlength="7"
                    placeholder="000 000"
                    class="input-field mt-2"
                  />
                </div>
                <div v-if="selectedPayment.id === 2" class="card-form">
                  <input
                    v-model="cardData.cardNumber"
                    placeholder="Card number"
                    class="input-field mb-3"
                  />
                  <div class="row-flex">
                    <input
                      v-model="cardData.date"
                      placeholder="MM/YY"
                      class="input-field"
                    />
                    <input
                      v-model="cardData.ccv"
                      placeholder="CVV"
                      class="input-field"
                    />
                  </div>
                </div>
                <div v-if="selectedPayment.id === 3" class="transfer-info">
                  <p class="mb-3">Please make a transfer to the following account:</p>
                  <div class="info-box">
                    <strong>Account:</strong>
                    {{ bankTransferDetails.accountNumber }}<br />
                    <strong class="mt-2" style="display:inline-block">Title:</strong> ORDER #[will be generated]
                  </div>
                </div>
              </div>
            </div>

            <div class="order-summary-box p-4 mt-4 mb-2">
              <div class="summary-line total-line">
                <span>Total to Pay:</span>
                <span class="total-price">PLN {{ totalOrderSum }}</span>
              </div>
            </div>
          </div>

          <div v-else class="success-flow-form">
            <div class="success-header-content">
              <i class="fa-solid fa-check-circle success-icon mb-2"></i>
              <h3>Thank you for your order!</h3>
              <p class="order-number-text">
                Your order number is: <strong>#{{ finalOrderId }}</strong>
              </p>
            </div>

            <div
              v-if="selectedPayment && selectedPayment.id === 3"
              class="bank-transfer-alert mt-4"
            >
              <h4 class="alert-title">
                <i class="fa-solid fa-building-columns"></i> Bank Transfer
                Instructions
              </h4>
              <p>Please transfer the exact amount to complete your order:</p>
              <div class="bank-details-box">
                <div class="detail-row">
                  <span>Account:</span>
                  <strong>{{ bankTransferDetails.accountNumber }}</strong>
                </div>
                <div class="detail-row mt-3">
                  <span>Title:</span>
                  <strong>{{ bankTransferDetails.title }}</strong>
                </div>
              </div>
            </div>

            <div class="order-summary-box p-4 mt-4">
              <h4
                class="mb-4"
                style="
                  color: #151875;
                  border-bottom: 1px solid #eae8f5;
                  padding-bottom: 12px;
                "
              >
                Items Ordered:
              </h4>
              <div
                v-for="(item, index) in finalOrderItems"
                :key="index"
                class="summary-line mb-3"
              >
                <span style="flex: 2">{{
                  item.product.nazwaProduktu || "Product"
                }}</span>
                <span style="flex: 1; text-align: center"
                  >x{{ item.ilosc }}</span
                >
                <span style="flex: 1; text-align: right; color: #4a405c"
                  >{{ (item.product.cenaPoPromocji || 0).toFixed(2) }} PLN</span
                >
              </div>
              <div
                class="summary-line total-line mt-4 pt-4"
                style="border-top: 2px dashed #c2c6e2"
              >
                <span>Total Paid:</span>
                <span class="total-price">PLN {{ finalOrderTotal }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <template v-if="!orderSuccess">
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
          </template>

          <template v-else>
            <div style="display: flex; flex-direction: column; width: 100%; gap: 12px;">
              <button
                class="btn-secondary"
                style="width: 100%"
                @click="downloadInvoice"
                :disabled="isDownloading"
              >
                <i class="fa-solid fa-file-pdf"></i> {{ isDownloading ? "Generating..." : "Download Invoice" }}
              </button>
              <button
                class="btn-primary"
                style="width: 100%"
                @click="closeSuccessModal"
              >
                Continue Shopping
              </button>
            </div>
          </template>
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
.p-4 {
  padding: 1.75rem;
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
  max-width: 680px;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(74, 64, 92, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 2rem;
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
  padding: 2rem 2.5rem;
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
  font-size: 0.95rem;
  color: #8a8fb9;
  margin: 0;
}

.summary-box {
  background: #fbfbfe;
  border: 1px solid #eae8f5;
  border-radius: 8px;
  padding: 1.75rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  font-size: 1rem;
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
  gap: 16px;
}

.input-field {
  width: 100%;
  padding: 14px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  box-sizing: border-box;
}

.payment-details-box {
  background: #f8f9ff;
  padding: 1.75rem;
  border-radius: 8px;
  border: 1px solid #eae8f5;
}

.row-flex {
  display: flex;
  gap: 14px;
}

.info-box {
  background: white;
  padding: 16px;
  border-left: 4px solid #3f509e;
  font-size: 0.95rem;
  color: #151875;
}

.card-form input {
  margin-bottom: 14px;
}

.payment-card-option {
  flex: 1;
  height: 105px;
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 10px;
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
  gap: 8px;
}

.payment-option-icon {
  font-size: 1.8rem;
  color: #3f509e;
}

.payment-option-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #151875;
}

.checked-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ffffff;
  color: #7e4cd4;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-text {
  font-size: 0.9rem;
  color: #e03a5b;
  font-weight: 500;
}

.discount-input-group {
  display: flex;
  gap: 12px;
  transition: all 0.3s ease;
}

.discount-input-group .input-field {
  flex: 1;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background-color 0.3s ease;
}

.discount-input-group.error-state .input-field {
  border-color: #e03a5b;
  background-color: #fff5f7;
  box-shadow: 0 0 0 3px rgba(224, 58, 91, 0.1);
  color: #e03a5b;
}

.btn-apply {
  background-color: #151875;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-apply:hover:not(:disabled) {
  background-color: #3f509e;
}

.btn-apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.discount-line {
  font-size: 1rem;
  font-weight: 600;
  color: #151875;
}

.discount-price {
  color: #10b981;
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
  font-size: 1.25rem;
  font-weight: 700;
  color: #151875;
  margin-bottom: 0;
}

.total-price {
  color: #fb2e86;
  font-size: 1.4rem;
}

.modal-footer {
  padding: 1.5rem 2.5rem;
  background-color: #fbfbfe;
  border-top: 1px solid #eae8f5;
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.85rem 2rem;
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
.success-header-content {
  text-align: center;
  padding: 2rem 0;
}

.success-icon {
  font-size: 4rem;
  color: #10b981;
}

.success-header-content h3 {
  color: #151875;
  margin-top: 16px;
  margin-bottom: 8px;
}

.order-number-text {
  color: #8a8fb9;
  font-size: 1.15rem;
}

.bank-transfer-alert {
  background-color: #fff8e1;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  padding: 1.75rem;
  color: #4a405c;
}

.alert-title {
  color: #b45309;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
}

.bank-details-box {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #fde68a;
  margin-top: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.05rem;
}

.pt-3 {
  padding-top: 1rem;
}
.pt-4 {
  padding-top: 1.5rem;
}

@media (max-width: 600px) {
  .modal-body {
    padding: 1.5rem;
  }
  .modal-header {
    padding: 1.25rem 1.5rem;
  }
  .modal-footer {
    padding: 1.25rem 1.5rem;
  }
  .payment-layout {
    flex-direction: column;
  }
}
</style>