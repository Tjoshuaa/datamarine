export type CartItem = {
  id: number
  name: string
  price: number
  image_url?: string
  quantity: number
}

let cart: CartItem[] = []

export function getCart() {
  return cart
}

export function addToCart(item: CartItem) {
  const existing = cart.find((p) => p.id === item.id)

  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }
}

export function removeFromCart(id: number) {
  cart = cart.filter((item) => item.id !== id)
}

export function clearCart() {
  cart = []
}