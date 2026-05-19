import { ref, computed } from "vue"
import api from "@/services/axios.js"

const STORAGE_KEY = "shopping_cart"
const token = localStorage.getItem("token")
const userId = JSON.parse(localStorage.getItem("user"))?.id

export const cartItems = ref([])
const cartId = ref(null)

const syncLocalStorage = () => {
  if (!token) {
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
  if (!token) {
    const localData = localStorage.getItem(STORAGE_KEY)
    cartItems.value = localData ? JSON.parse(localData) : []
    return cartItems.value
  }

  try {
    const { data } = await api.get(`cart/latest/${userId}`)
    cartItems.value = data.pozycje || []
    cartId.value = data.idKoszyka
    return cartItems.value
  } catch (error) {
    if (error.response?.status === 404) {
      return await createRemoteCart()
    }
    throw error
  }
}

export const updateQuantity = async (productId, delta, showAlert) => {
  if (!productId) return false

  try {
    const { data: product } = await api.get(`products/${productId}`)

    const item = cartItems.value.find((i) => i.idProduktu === productId)
    const currentQty = item ? item.ilosc : 0
    const newQty = currentQty + delta

    if (newQty > product.stanMagazynowy) {
      showAlert({
        type: "warning",
        message: `Max stock: ${product.stanMagazynowy}`,
        duration: 800
      })
      return false
    }

    if (newQty <= 0) return false

    if (!token) {
      if (item) {
        item.ilosc = newQty
      } else {
        cartItems.value.push({ idProduktu: productId, ilosc: 1, product })
      }
      syncLocalStorage()
    } else {
      const payload = {
        idPozycji: item.idPozycji,
        IdKoszyka: cartId.value,
        IdProduktu: productId,
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
  try {
    if (!cartId.value && token) await getCart()
    //fixes diffrent Id name
    if(product.productId) product.idProduktu = product.productId 
    const exists = cartItems.value.some(
      (i) => i.idProduktu === product.idProduktu,
    )

    if (exists) {
      return await updateQuantity(product.idProduktu, 1, showAlert)
    }

    if (!token) {
      cartItems.value.push({
        idProduktu: product.idProduktu,
        ilosc: 1,
        product: product,
      })
      syncLocalStorage()
    } else {
      await api.post("cartitems", {
        idKoszyka: cartId.value,
        idProduktu: product.idProduktu ,
        ilosc: 1,
      })
      await getCart()
    }

    showAlert({ type: "success", message: "Added to cart", duration: 1000 })
  } catch (error) {
    showAlert({ type: "error", message: "Failed to add product",duration: 1000 })
  }
}

export const removeFromCart = async (itemId, showAlert) => {
  if (!token) {
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

  showAlert({ type: "success", message: "Item removed", duration: 1000})
}

export const clearCart = () => {
  cartItems.value = []
  if (token) api.delete(`cart/${cartId.value}`)
  else localStorage.removeItem(STORAGE_KEY)
}
