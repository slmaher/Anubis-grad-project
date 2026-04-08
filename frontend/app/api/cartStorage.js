import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "marketplace-cart";

const clampQuantity = (value) => {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return 1;
  return Math.max(1, Math.floor(numericValue));
};

const normalizeItem = (item) => {
  return {
    id: String(item.id),
    nameKey: item.nameKey,
    price: Number(item.price || 0),
    image: item.image,
    quantity: clampQuantity(item.quantity),
  };
};

export async function getCartItems() {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeItem);
  } catch {
    return [];
  }
}

export async function setCartItems(items) {
  const normalized = Array.isArray(items) ? items.map(normalizeItem) : [];
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function addItemToCart(item) {
  const current = await getCartItems();
  const index = current.findIndex((entry) => String(entry.id) === String(item.id));

  if (index >= 0) {
    current[index] = {
      ...current[index],
      quantity: current[index].quantity + 1,
    };
  } else {
    current.push(normalizeItem({ ...item, quantity: 1 }));
  }

  return setCartItems(current);
}

export async function updateCartItemQuantity(itemId, delta) {
  const current = await getCartItems();
  const next = current
    .map((item) => {
      if (String(item.id) !== String(itemId)) return item;

      const quantity = item.quantity + Number(delta || 0);
      if (quantity <= 0) return null;

      return {
        ...item,
        quantity,
      };
    })
    .filter(Boolean);

  return setCartItems(next);
}

export async function clearCart() {
  await AsyncStorage.removeItem(CART_KEY);
}

export function getCartTotals(items) {
  const safeItems = Array.isArray(items) ? items : [];

  const totalItems = safeItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = safeItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0,
  );

  return {
    totalItems,
    totalPrice,
  };
}
