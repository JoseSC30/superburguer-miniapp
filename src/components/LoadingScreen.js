import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md">
        <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando...</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
