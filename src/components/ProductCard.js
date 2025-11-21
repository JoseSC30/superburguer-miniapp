import React from 'react';
import { Plus } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
      {product.imageUrl ? (
        <div className="h-48 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="h-48 bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center"><span class="text-6xl">🍔</span></div>';
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
          <span className="text-6xl">🍔</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-orange-600">
            Bs. {parseFloat(product.price).toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
