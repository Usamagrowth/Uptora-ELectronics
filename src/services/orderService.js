export const orders = [
  {
    id: "ORD-1001",
    customerName: "Sade Johnson",
    customerEmail: "sade@uptora.com",
    date: "2026-05-08",
    total: 180.49,
    paymentRef: "PSK_8B3F2A",
    deliveryStatus: "Delivered",
    status: "Delivered",
    items: [
      { name: "Solar panel", quantity: 1 },
      { name: "Air Fryer", quantity: 1 },
    ],
  },
  {
    id: "ORD-1002",
    customerName: "Sade Johnson",
    customerEmail: "sade@uptora.com",
    date: "2026-06-01",
    total: 253.99,
    paymentRef: "PSK_4F5D7E",
    deliveryStatus: "In transit",
    status: "Shipped",
    items: [
      { name: "Bluetooth Speaker", quantity: 2 },
    ],
  },
  {
    id: "ORD-1003",
    customerName: "Elias Thomas",
    customerEmail: "elias@uptora.com",
    date: "2026-06-02",
    total: 599.0,
    paymentRef: "PSK_9H1K0M",
    deliveryStatus: "Pending",
    status: "Pending",
    items: [
      { name: "HP Laptop", quantity: 1 },
      { name: "Resistance Band Set", quantity: 3 },
    ],
  },
];

export function getUserOrders(email) {
  return orders.filter((order) => order.customerEmail === email);
}

export function getOrders() {
  return orders;
}
