import { Product } from "./typesProduct";

interface Props {
  product: Product;
  onToggleActive?: () => void;
  togglingId?: string;
  onDelete: () => void;
}

export default function ProductCard({ product, onToggleActive, togglingId, onDelete }: Props) {
  return (
    // Tambahkan "relative" dan "group" di sini
    <div className="relative group border p-5 rounded-[2rem] shadow-sm bg-white hover:shadow-md transition-all">
      
      {/* Tombol Hapus - Sekarang akan muncul saat card di-hover */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute bottom-3 right-3 p-2 bg-rose-50 text-rose-500 rounded-full group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-sans font-semibold">{product.name}</h2>
          <p className="text-[10px] text-slate-400 ">Master Product</p>
        </div>

        {/* Toggle Switch */}
        <div
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
            product.active ? "bg-green-500" : "bg-gray-300"
          } ${togglingId === product._id ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={togglingId === product._id ? undefined : onToggleActive}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
              product.active ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {product.variants?.length ? (
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400">Varian Tersedia:</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: string) => (
              <span key={v} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                {v}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}