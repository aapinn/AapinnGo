"use client";
import { Order } from "./type";

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <h3 className="font-semibold text-lg">{order.customerName}</h3>
      <p className="text-sm text-gray-500">
        Total Item: {order.itemsCount}
      </p>
      <span
        className={`mt-2 inline-block rounded px-2 py-1 text-xs font-medium ${
          order.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : order.status === "process"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {order.status.toUpperCase()}
      </span>
    </div>
  );
}

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-bold">
          Detail Pesanan - {order.customerName}
        </h3>

        {order.items && order.items.length > 0 ? (
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>x{item.qty}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Belum ada detail item</p>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded bg-black py-2 text-white"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
