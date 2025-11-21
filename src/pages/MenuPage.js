import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { getProducts, getUserByTelegramId } from '../services/api';
import { tg, initTelegramApp, getTelegramUserId } from '../utils/telegram';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import ProductCard from '../components/ProductCard';

export default function MenuPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backendUserId, setBackendUserId] = useState(null);
    const mainButtonHandlerRef = useRef(null);

    useEffect(() => {
        initTelegramApp();
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            const telegramId = getTelegramUserId();
            console.log('Telegram ID:', telegramId);

            const [productsData, userData] = await Promise.all([
                getProducts(),
                getUserByTelegramId(telegramId)
            ]);

            console.log('Productos cargados:', productsData);
            console.log('Usuario cargado:', userData);

            const activeProducts = productsData.filter(p => p.active);
            setProducts(activeProducts);

            if (userData) {
                if (Array.isArray(userData) && userData.length > 0) {
                    setBackendUserId(userData[0].id);
                    console.log('Usuario ID (array):', userData[0].id);
                } else if (userData.id) {
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
        return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    }, [cart]);

    const handleShowOrderSummary = useCallback(() => {
        if (cart.length === 0) return;

        // Solo mostrar resumen de la orden
        console.log('Resumen del pedido:', {
            userId: backendUserId,
            items: cart,
            total: getTotal()
        });

        alert(`Pedido listo:\n\nTotal: Bs. ${getTotal().toFixed(2)}\n\nEste pedido se enviará cuando el backend lo solicite a través de la ruta /pagoqr`);
    }, [cart, backendUserId, getTotal]);

    useEffect(() => {
        if (mainButtonHandlerRef.current) {
            tg.MainButton.offClick(mainButtonHandlerRef.current);
        }

        if (cart.length > 0) {
            mainButtonHandlerRef.current = handleShowOrderSummary;

            tg.MainButton.text = `Ver Resumen (Bs. ${getTotal().toFixed(2)})`;
            tg.MainButton.show();
            tg.MainButton.onClick(handleShowOrderSummary);
        } else {
            tg.MainButton.hide();
            mainButtonHandlerRef.current = null;
        }

        return () => {
            if (mainButtonHandlerRef.current) {
                tg.MainButton.offClick(mainButtonHandlerRef.current);
            }
        };
    }, [cart, getTotal, handleShowOrderSummary]);

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

    if (loading) {
        return <LoadingScreen message="Obteniendo el menú de SuperSuperBurguer" />;
    }

    if (error && products.length === 0) {
        return <ErrorScreen message={error} onRetry={loadInitialData} />;
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

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4">
                {!showCart ? (
                    // Menu View
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.length === 0 ? (
                            <div className="col-span-2 text-center py-12">
                                <p className="text-white text-xl">No hay productos disponibles en este momento</p>
                            </div>
                        ) : (
                            products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={addToCart}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    // Cart View
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
