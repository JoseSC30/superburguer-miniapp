// Servicio para consumir el backend de SuperSuperBurguer

const API_BASE_URL = 'https://e6cd06421299.ngrok-free.app';

// Función auxiliar para hacer peticiones
const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Header necesario para ngrok
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error en petición a ${endpoint}:`, error);
        throw error;
    }
};

// Obtener todos los productos
export const getProducts = async () => {
    return await fetchAPI('/products');
};

// Obtener usuario por Telegram ID
export const getUserByTelegramId = async (telegramId) => {
    return await fetchAPI(`/users/telegram/${telegramId}`);
};

// Crear una nueva orden
export const createOrder = async (orderData) => {
    return await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
};

// Obtener una orden por ID - Obtiene la orden y envia un mensaje consultado si quiere pagar o cancelar.
export const getOrderById = async (orderId) => {
    return await fetchAPI(`/orders/${orderId}`);
};

// Obtener una orden por ID - Version 02 -Solo obtiene la orden como debe ser
export const getOrderByIdV02 = async (orderId) => {
    return await fetchAPI(`/orders/v02/${orderId}`);
};

// Actualizar estado de una orden a CONFIRMED
export const confirmOrder = async (orderId) => {
    return await fetchAPI(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONFIRMADO' }),
    });
};

// Llamado al endpoint para el mensaje de pedido confirmado. Se le pasa el parametro orderId y el telegramId
// Esta es la ruta declarada en el backend para enviar el mensaje al usuario: @Get('response-after-payqr/:chatId/:orderId')
export const sendOrderConfirmedMessage = async (telegramId, orderId) => {
    return await fetchAPI(`/telegram/response-after-payqr/${telegramId}/${orderId}`);
};

