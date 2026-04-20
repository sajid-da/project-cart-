import { useState } from "react";
import { Package } from "lucide-react";

interface Product {
  id?: number;
  name: string;
  imageUrl?: string | null;
  categoryId?: number | null;
}

const CATEGORY_EMOJI: Record<number, string> = {
  1: "🥦", 2: "🥛", 3: "🌾", 4: "☕", 5: "🍪",
  6: "🌶️", 7: "🧹", 8: "💄", 9: "🧊", 10: "🍼",
};

const CATEGORY_GRADIENT: Record<number, string> = {
  1: "from-green-400 to-emerald-600",
  2: "from-blue-300 to-sky-500",
  3: "from-amber-300 to-yellow-600",
  4: "from-orange-400 to-red-500",
  5: "from-yellow-400 to-orange-500",
  6: "from-red-500 to-rose-700",
  7: "from-cyan-400 to-blue-600",
  8: "from-pink-400 to-fuchsia-600",
  9: "from-indigo-400 to-blue-600",
  10: "from-pink-300 to-purple-500",
};

export function ProductImage({
  product,
  className = "w-full h-full object-cover rounded-md",
}: {
  product: Product;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!product.imageUrl || errored) {
    const emoji = CATEGORY_EMOJI[product.categoryId ?? 0] ?? "📦";
    const grad = CATEGORY_GRADIENT[product.categoryId ?? 0] ?? "from-slate-400 to-slate-600";
    return (
      <div
        className={`${className} bg-gradient-to-br ${grad} flex flex-col items-center justify-center text-white relative overflow-hidden`}
        data-testid={`img-fallback-${product.id ?? "x"}`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <span className="text-5xl drop-shadow-lg z-10">{emoji}</span>
        <span className="text-[10px] font-semibold mt-1 px-2 text-center line-clamp-2 z-10 drop-shadow">
          {product.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={product.imageUrl}
      alt={product.name}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      data-testid={`img-product-${product.id ?? "x"}`}
    />
  );
}
