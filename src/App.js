import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Send } from 'lucide-react';

// Obtener la API de Telegram WebApp
const tg = window.Telegram?.WebApp || {
  initData: '',
  initDataUnsafe: { user: { id: 123, first_name: 'Demo' } },
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

const burgers = [
  { id: 1, name: 'Clásica', price: 25, desc: 'Carne, lechuga, tomate, queso' },
  { id: 2, name: 'Doble Queso', price: 35, desc: 'Doble carne, doble queso, bacon' },
  { id: 3, name: 'BBQ Especial', price: 40, desc: 'Carne, cebolla caramelizada, salsa BBQ' },
  { id: 4, name: 'Vegetariana', price: 30, desc: 'Hamburguesa de lentejas, vegetales' }
];

export default function SuperBurguerApp() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const mainButtonHandlerRef = useRef(null);

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
  }, []);

  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const handleSendOrder = useCallback(() => {
    if (cart.length === 0) return;
    
    const orderData = {
      user_id: tg.initDataUnsafe?.user?.id || 'demo_user',
      user_name: tg.initDataUnsafe?.user?.first_name || 'Usuario Demo',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: getTotal(),
      timestamp: new Date().toISOString()
    };

    // Enviar datos al bot de Telegram
    if (tg.sendData) {
      try {
        tg.sendData(JSON.stringify(orderData));
      } catch (error) {
        console.error('Error al enviar datos:', error);
      }
    } else {
      // Modo demo: solo mostrar en consola
      console.log('Pedido enviado:', orderData);
      setOrderSent(true);
      setTimeout(() => {
        tg.close();
      }, 2000);
    }
  }, [cart, getTotal]);

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

  const addToCart = (burger) => {
    const existing = cart.find(item => item.id === burger.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === burger.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...burger, quantity: 1 }]);
    }
  };

  const removeFromCart = (burgerId) => {
    const existing = cart.find(item => item.id === burgerId);
    if (!existing) return;
    
    if (existing.quantity > 1) {
      setCart(cart.map(item =>
        item.id === burgerId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== burgerId));
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800">🍔 SuperBurguer</h1>
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

      {/* Menu */}
      <div className="max-w-4xl mx-auto p-4">
        {!showCart ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {burgers.map(burger => (
              <div key={burger.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                <div className="h-32 bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                  <span className="text-6xl">🍔</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{burger.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{burger.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">Bs. {burger.price}</span>
                    <button
                      onClick={() => addToCart(burger)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                      <p className="text-sm text-gray-600">Bs. {item.price} c/u</p>
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
                        Bs. {item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-orange-600">Bs. {getTotal()}</span>
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