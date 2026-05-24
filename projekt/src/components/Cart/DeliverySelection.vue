<script setup>
import { computed } from "vue"

const props = defineProps({
  modelValue: {
    type: Object,
    default: {
      id: 0,
      name: "",
      price: 0.0,
      icon: "fa-solid fa-truck",
    },
    required: true,
  },
  isLocalDelivery: {
    type: Boolean,
    required: true,
  },
  variant: {
    type: String,
    default: "list",
    validator: (value) => ["list", "grid"].includes(value),
  },
})

const emit = defineEmits(["update:modelValue", "update:isLocalDelivery"])

const deliveryMethods = [
  { id: 1, name: "Standard Courier", price: 15.0, icon: "fa-solid fa-truck" },
  { id: 2, name: "Express Shipping", price: 25.5, icon: "fa-solid fa-bolt" },
  { id: 3, name: "Local Pickup", price: 0.0, icon: "fa-solid fa-box-open" },
]
const selectMethod = (method) => {
  const isLocal = method.id === 3
  emit("update:isLocalDelivery", isLocal)
  emit("update:modelValue", method)
}
</script>

<template>
  <div class="delivery-selection-container">
    <div :class="['delivery-layout', `variant-${props.variant}`]">
      <div
        v-for="method in deliveryMethods"
        :key="method.id"
        class="delivery-card-option"
        :class="{
          active: props.modelValue && props.modelValue.id === method.id,
        }"
        @click="selectMethod(method)"
      >
        <div v-if="props.modelValue === method.id" class="checked-badge">
          <i class="fa-solid fa-circle-check"></i>
        </div>

        <div class="delivery-content-main">
          <i :class="method.icon" class="delivery-option-icon"></i>
          <span class="delivery-option-name">{{ method.name }}</span>
        </div>

        <div class="delivery-action-zone">
          <span class="delivery-option-price">
            {{ method.price === 0 ? "Free" : method.price.toFixed(2) + " PLN" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delivery-selection-container {
  margin-top: 20px;
  text-align: left;
}

/* --- WARIANTY --- */
/* Wariant pionowej listy (koszyk) */
.delivery-layout.variant-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.delivery-layout.variant-list .delivery-card-option {
  width: 100%;
  height: 48px;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 16px;
}
.delivery-layout.variant-list .delivery-content-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delivery-layout.variant-grid {
  display: flex;
  flex-direction: row;
  gap: 12px;
}
.delivery-layout.variant-grid .delivery-card-option {
  flex: 1;
  height: 90px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  text-align: center;
}
.delivery-layout.variant-grid .delivery-content-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* --- BAZOWE STYLE KAFELKÓW --- */
.delivery-card-option {
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
}

.delivery-card-option:hover {
  border-color: #3f509e;
  background-color: #f8f9ff;
}

.delivery-card-option.active {
  border-color: #3f509e;
  background-color: #f6f5ff;
  box-shadow: 0 2px 8px rgba(63, 80, 158, 0.1);
}

.delivery-option-icon {
  font-size: 1.1rem;
  color: #3f509e;
}

.delivery-option-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #151875;
}

.delivery-action-zone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.variant-list .delivery-action-zone {
  justify-content: flex-end;
  min-width: 80px;
  height: 100%;
}

.delivery-action-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #a1a8c1;
  transition: all 0.25s ease;
  opacity: 1;
}

.delivery-option-price {
  position: absolute;
  font-size: 0.85rem;
  color: #8a8fb9;
  font-weight: 600;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.25s ease;
  pointer-events: none;
  white-space: nowrap;
}

.delivery-card-option:hover .delivery-action-text,
.delivery-card-option.active .delivery-action-text {
  opacity: 0;
  transform: translateY(-5px);
}

.delivery-card-option:hover .delivery-option-price,
.delivery-card-option.active .delivery-option-price {
  opacity: 1;
  transform: translateY(0);
}

.delivery-card-option.active .delivery-option-price {
  color: #3f509e;
}

.checked-badge {
  position: absolute;
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

.variant-list .checked-badge {
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
}

.variant-grid .checked-badge {
  top: -6px;
  right: -6px;
}
</style>
