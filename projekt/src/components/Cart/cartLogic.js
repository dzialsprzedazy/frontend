import { ref, computed, watch } from "vue"
import api from "@/services/axios.js"

const STORAGE_KEY = "shopping_cart"
const TOKEN_KEY = "token"

export const isLoggedIn = ref(localStorage.getItem(TOKEN_KEY) !== null)
const userId = JSON.parse(localStorage.getItem("user"))?.id
const isAddToCartActive = ref(false)
export const cartItems = ref([])
const cartId = ref(null)

export const isLocalDelivery = ref(false)
export const selectedDelivery = ref({
  id: 0,
  name: "",
  price: 0.0,
  icon: "fa-solid fa-truck",
})
export const addressForm = ref({
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
export const refreshLoggedInStatus = () => {
  isLoggedIn.value = localStorage.getItem(TOKEN_KEY) !== null
}
export const shippingCost = computed(() => {
  const address = addressForm.value
  const isCartEmpty = !cartItems.value || cartItems.value.length === 0
  const isLocal = selectedDelivery.value.id === 3
  const isPostalValid = /^\d{2}-\d{3}$/.test(address.postalCode)

  if (
    isCartEmpty ||
    isLocal ||
    address.city === "" ||
    address.street === "" ||
    address.buildingNo === "" ||
    !isPostalValid
  ) {
    return 0
  }

  let cost = selectedDelivery.value ? selectedDelivery.value.price : 0

  for (const item of cartItems.value) {
    if (!item.product || !item.product.kategorie) continue

    const isBook = item.product.kategorie.some((kategoria) => {
      const nazwaKategorii = kategoria.nazwaKategorii || kategoria.nazwa || ""
      return (
        nazwaKategorii.toLowerCase().includes("books") ||
        nazwaKategorii.toLowerCase().includes("book")
      )
    })

    if (isBook) {
      cost += 1.24 * (item.ilosc || 1)
    }
  }

  return cost
})
const syncLocalStorage = () => {
  if (!isLoggedIn.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems.value))
  }
}

export const cartSum = computed(() => {
  return cartItems.value.reduce((acc, item) => {
    const price = item.product?.cena || 0
    const qty = item.ilosc || 0
    return acc + price * qty
  }, 0)
})

export const cartCount = computed(() => {
  return cartItems.value.reduce((acc, item) => {
    const qty = item.ilosc || 0
    return acc + qty
  }, 0)
})

const createRemoteCart = async () => {
  const payload = {
    idUzytkownika: userId,
  }

  return await api.post("cart", payload)
}

export const getCart = async () => {
  if (isAddToCartActive.value) return
  isAddToCartActive.value = true
  refreshLoggedInStatus()
  if (!isLoggedIn.value) {
    const localData = localStorage.getItem(STORAGE_KEY)
    cartItems.value = localData ? JSON.parse(localData) : []
    isAddToCartActive.value = false
    return cartItems.value
  }
  try {
    const { data } = await api.get(`cart/latest/${userId}`)
    let dbCart = data.pozycje || []
    cartItems.value = dbCart
    cartId.value = data.idKoszyka
    isAddToCartActive.value = false
    return cartItems.value
  } catch (error) {
    if (error.response?.status === 404) {
      return await createRemoteCart()
    }
    throw error
  } finally {
    isAddToCartActive.value = false
  }
}

export const updateQuantity = async (product, delta, showAlert) => {
  refreshLoggedInStatus()
  if (!product) return false

  try {
    const item = cartItems.value.find(
      (i) => i.idProduktu === product.idProduktu,
    )
    const currentQty = item ? item.ilosc : 0
    const newQty = currentQty + delta
    const isValid = await isItemQuantityValid(product.idProduktu, newQty)
    if (!isValid) {
      showAlert({
        type: "warning",
        message: `Max stock`,
        duration: 800,
      })
      return false
    }
    if (!isLoggedIn.value) {
      if (item) {
        item.ilosc = newQty
      } else {
        cartItems.value.push({
          idProduktu: product.idProduktu,
          ilosc: 1,
          product,
        })
      }
      syncLocalStorage()
    } else {
      const payload = {
        idPozycji: item.idPozycji,
        IdKoszyka: cartId.value,
        IdProduktu: product.idProduktu,
        Ilosc: delta,
      }
      await api.put(`cartitems`, payload)
      await getCart()
    }

    return true
  } catch (error) {
    console.error("Update error:", error)
    return false
  }
}
export const addToCart = async (product, showAlert) => {
  refreshLoggedInStatus()
  try {
    if (!cartId.value && isLoggedIn.value) await getCart()
    //fixes diffrent Id name
    if (product.productId) product.idProduktu = product.productId
    const exists = cartItems.value.some(
      (i) => i.idProduktu === product.idProduktu,
    )

    if (exists) {
      return await updateQuantity(product, 1, showAlert)
    }
    const isValid = await isItemQuantityValid(product.idProduktu, 1)
    if (!isValid) {
      showAlert({
        type: "error",
        message: "Product is not avaliable",
        duration: 1000,
      })

      return
    }
    if (!isLoggedIn.value) {
      cartItems.value.push({
        idProduktu: product.idProduktu,
        ilosc: 1,
        product: product,
      })
      syncLocalStorage()
    } else {
      await api.post("cartitems", {
        idKoszyka: cartId.value,
        idProduktu: product.idProduktu,
        ilosc: 1,
      })
      await getCart()
    }

    showAlert({ type: "success", message: "Added to cart", duration: 1000 })
  } catch (error) {
    showAlert({
      type: "error",
      message: "Failed to add product",
      duration: 1000,
    })
  }
}

export const removeFromCart = async (itemId, showAlert) => {
  if (!isLoggedIn.value) {
    cartItems.value = cartItems.value.filter((i) => i.idProduktu !== itemId)
    syncLocalStorage()
  } else {
    try {
      await api.delete(`cartitems/${itemId}`)
      await getCart()
    } catch (e) {
      console.error(e)
    }
  }

  showAlert({ type: "success", message: "Item removed", duration: 1000 })
}
const isItemQuantityValid = async (productId, newQty) => {
  if (newQty <= 0) return false
  const { data: product } = await api.get(`products/${productId}`)
  return newQty <= product.stanMagazynowy
}
export const clearCart = () => {
  cartItems.value = []
  if (isLoggedIn.value) api.delete(`cart/${cartId.value}`)
  else localStorage.removeItem(STORAGE_KEY)
}
