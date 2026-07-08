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
    cart.push({
      ...item,
      quantity: 1,
    })
  }

  return cart
}

export function removeFromCart(id: number) {
  cart = cart.filter(
    (item) => item.id !== id
  )

  return cart
}

export function updateQuantity(
  id: number,
  quantity: number
) {
  cart = cart.map((item) =>
    item.id === id
      ? {
          ...item,
          quantity,
        }
      : item
  )

  return cart
}

export function clearCart() {
  cart = []
  return cart
}

export function getCartTotal() {
  return cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  )
}