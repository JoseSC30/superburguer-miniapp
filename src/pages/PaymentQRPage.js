import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, Loader } from 'lucide-react';
import { getOrderByIdV02, confirmOrder, sendOrderConfirmedMessage } from '../services/api';
import { tg, initTelegramApp } from '../utils/telegram';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

export default function PaymentQRPage() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmingPayment, setConfirmingPayment] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    useEffect(() => {
        initTelegramApp();

        // Obtener el ID de la orden desde los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');

        if (!orderId) {
            setError('No se especificó una orden');
            setLoading(false);
            return;
        }

        loadOrder(orderId);
    }, []);

    const loadOrder = async (orderId) => {
        try {
            setLoading(true);
            const orderData = await getOrderByIdV02(orderId);
            console.log('Orden cargada:', orderData);
            setOrder(orderData);
            setLoading(false);
        } catch (err) {
            console.error('Error al cargar orden:', err);
            setError('Error al cargar la orden');
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!order || confirmingPayment) return;

        try {
            setConfirmingPayment(true);

            console.log('Confirmando pago para orden:', order.id);

            await confirmOrder(order.id);

            console.log('Pago confirmado exitosamente');

            setPaymentConfirmed(true);
            setConfirmingPayment(false);

            //
            await sendOrderConfirmedMessage(tg.initDataUnsafe.user.id, order.id);
            //await sendOrderConfirmedMessage(order.userId, order.id);
            console.log('Mensaje de confirmación enviado al usuario');
            //

            setTimeout(() => {
                tg.close();
            }, 2000);

        } catch (error) {
            console.error('Error al confirmar pago:', error);
            setError('Error al confirmar el pago. Intenta nuevamente.');
            setConfirmingPayment(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Obteniendo información del pedido" />;
    }

    if (error) {
        return <ErrorScreen message={error} />;
    }

    if (paymentConfirmed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Confirmado!</h2>
                    <p className="text-gray-600">Tu pedido está siendo preparado. Te notificaremos cuando esté listo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Escanea para Pagar</h2>

                {/* QR Code Placeholder */}
                <div className="bg-white border-4 border-gray-300 rounded-xl p-8 mb-6 mx-auto" style={{ width: '280px', height: '280px' }}>
                    <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <QrCode className="w-32 h-32 text-orange-500 mb-4" />
                        <p className="text-sm text-gray-600">Código QR</p>
                        <p className="text-xs text-gray-500 mt-2">Orden #{order.id}</p>
                    </div>
                </div>

                {/* Total */}
                <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total a pagar:</p>
                    <p className="text-3xl font-bold text-orange-600">Bs. {parseFloat(order.total).toFixed(2)}</p>
                </div>

                {/* Botón de confirmar pago */}
                <button
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 ${confirmingPayment
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                >
                    {confirmingPayment ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Confirmando...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Confirmar Pago
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-500 mt-4">
                    Presiona "Confirmar Pago" después de realizar la transferencia
                </p>
            </div>
        </div>
    );
}
