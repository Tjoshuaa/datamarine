export type CartItem = {
  id: number
  name: string
  price: number
  image_url?: string
  quantity: number
}

const CART_KEY = "datamarine-cart"

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(CART_KEY)

  return stored ? JSON.parse(stored) : []
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return

  localStorage.setItem(CART_KEY, JSON.stringify(cart))

  window.dispatchEvent(new Event("cartUpdated"))
}

export function getCart() {
  return loadCart()
}

export function addToCart(item: CartItem) {
  const cart = loadCart()

  const existing = cart.find((p) => p.id === item.id)

  if (existing) {
    existing.quantity += item.quantity || 1
  } else {
    cart.push({
      ...item,
      quantity: item.quantity || 1,
    })
  }

  saveCart(cart)

  return cart
}

export function removeFromCart(id: number) {
  const cart = loadCart().filter((item) => item.id !== id)

  saveCart(cart)

  return cart
}

export function updateQuantity(id: number, quantity: number) {
  const cart = loadCart().map((item) =>
    item.id === id
      ? { ...item, quantity }
      : item
  )

  saveCart(cart)

  return cart
}

export function clearCart() {
  saveCart([])

  return []
}

export function getCartTotal() {
  return loadCart().reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
}