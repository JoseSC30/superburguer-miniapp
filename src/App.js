import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Send, Loader } from 'lucide-react';
import { getProducts, getUserByTelegramId, createOrder } from './services/api';

// Obtener la API de Telegram WebApp
const tg = window.Telegram?.WebApp || {
  initData: '',
  initDataUnsafe: { user: { id: '123', first_name: 'Demo' } },
  MainButton: {
    text: 'Enviar Pedido',
    show: () => console.log('MainButton shown'),
    hide: () => console.log('MainButton hidden'),
    onClick: (fn) => {
      console.log('MainButton clicked');
      if (fn) fn();
    },
    offClick: (fn) => console.log('MainButton offClick')
  },
  close: () => console.log('App closed'),
  ready: () => console.log('App ready'),
  expand: () => console.log('App expanded'),
  BackButton: {
    show: () => console.log('BackButton shown'),
    hide: () => console.log('BackButton hidden'),
    onClick: (fn) => console.log('BackButton onClick'),
    offClick: (fn) => console.log('BackButton offClick')
  }
};

export default function SuperBurguerApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendUserId, setBackendUserId] = useState(null);
  const [sendingOrder, setSendingOrder] = useState(false);
  const mainButtonHandlerRef = useRef(null);

  // Cargar productos y usuario al iniciar
  useEffect(() => {
    tg.ready();
    tg.expand();
    
    // Configurar colores del tema
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#fb923c'); // orange-400
    }
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#fb923c');
    }

    // Cargar datos del backend
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener Telegram ID
      const telegramId = tg.initDataUnsafe?.user?.id?.toString() || '5869516446';
      console.log('Telegram ID:', telegramId);

      // Cargar productos y usuario en paralelo
      const [productsData, userData] = await Promise.all([
        getProducts(),
        getUserByTelegramId(telegramId)
      ]);

      console.log('Productos cargados:', productsData);
      console.log('Usuario cargado:', userData);

      // Filtrar solo productos activos
      const activeProducts = productsData.filter(p => p.active);
      setProducts(activeProducts);

      // Guardar el ID del usuario del backend
      // El backend puede devolver un objeto directamente o un array
      if (userData) {
        if (Array.isArray(userData) && userData.length > 0) {
          // Si es un array, tomar el primer elemento
          setBackendUserId(userData[0].id);
          console.log('Usuario ID (array):', userData[0].id);
        } else if (userData.id) {
          // Si es un objeto directo, tomar su id
          setBackendUserId(userData.id);
          console.log('Usuario ID (objeto):', userData.id);
        } else {
          setError('Usuario no encontrado en el sistema');
        }
      } else {
        setError('Usuario no encontrado en el sistema');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al conectar con el servidor. Intenta nuevamente.');
      setLoading(false);
    }
  };

  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const handleSendOrder = useCallback(async () => {
    if (cart.length === 0 || !backendUserId || sendingOrder) return;
    
    try {
      setSendingOrder(true);
      
      // Preparar datos de la orden según el formato del backend
      const orderData = {
        userId: backendUserId,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      console.log('Enviando orden:', orderData);

      // Enviar orden al backend
      const response = await createOrder(orderData);
      console.log('Orden creada:', response);

      // Mostrar mensaje de éxito
      setOrderSent(true);
      
      // Cerrar la app después de 2 segundos
      setTimeout(() => {
        tg.close();
      }, 2000);

    } catch (error) {
      console.error('Error al enviar orden:', error);
      setError('Error al enviar el pedido. Intenta nuevamente.');
      setSendingOrder(false);
    }
  }, [cart, backendUserId, sendingOrder]);

  useEffect(() => {
    // Limpiar el handler anterior si existe
    if (mainButtonHandlerRef.current) {
      tg.MainButton.offClick(mainButtonHandlerRef.current);
    }

    if (cart.length > 0) {
      // Guardar referencia al nuevo handler
      mainButtonHandlerRef.current = handleSendOrder;
      
      tg.MainButton.text = `Enviar Pedido (Bs. ${getTotal()})`;
      tg.MainButton.show();
      tg.MainButton.onClick(handleSendOrder);
    } else {
      tg.MainButton.hide();
      mainButtonHandlerRef.current = null;
    }

    return () => {
      if (mainButtonHandlerRef.current) {
        tg.MainButton.offClick(mainButtonHandlerRef.current);
      }
    };
  }, [cart, getTotal, handleSendOrder]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (!existing) return;
    
    if (existing.quantity > 1) {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md">
          <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando...</h2>
          <p className="text-gray-600">Obteniendo el menú de SuperSuperBurguer</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de pedido enviado
  if (orderSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Enviado!</h2>
          <p className="text-gray-600">Tu pedido está siendo procesado. Te notificaremos pronto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🍔 SuperSuperBurguer</h1>
            <p className="text-sm text-gray-600">Las mejores hamburguesas</p>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="max-w-4xl mx-auto p-4">
        {!showCart ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-white text-xl">No hay productos disponibles en este momento</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
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
                      <span className="text-2xl font-bold text-orange-600">Bs. {parseFloat(product.price).toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu Pedido</h2>
            {cart.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Tu carrito está vacío</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">Bs. {parseFloat(item.price).toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-green-100 text-green-600 p-1 rounded hover:bg-green-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-orange-600 w-20 text-right">
                        Bs. {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-orange-600">Bs. {getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}