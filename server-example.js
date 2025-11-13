// Backend simple para procesar pedidos de SuperBurguer Mini App
// Ejemplo con Express.js y node-telegram-bot-api

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

// Configuración
const BOT_TOKEN = process.env.BOT_TOKEN || 'TU_TOKEN_AQUI';
const PORT = process.env.PORT || 3001;
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://tu-app.vercel.app';

// Inicializar bot y servidor
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());

// Base de datos en memoria (usar una BD real en producción)
const orders = new Map();
let orderCounter = 1;

// Comando /start - Mostrar botón de la Mini App
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🍔 *¡Bienvenido a SuperBurguer!*

Las mejores hamburguesas están a solo un click de distancia.

Presiona el botón de abajo para ver nuestro menú y hacer tu pedido.
  `;

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [[
        {
          text: '🍔 Hacer Pedido',
          web_app: { url: MINI_APP_URL }
        }
      ], [
        { text: '📋 Ver Mis Pedidos' },
        { text: '❓ Ayuda' }
      ]],
      resize_keyboard: true
    }
  });
});

// Recibir datos de la Mini App
bot.on('message', async (msg) => {
  if (msg.web_app_data) {
    try {
      const chatId = msg.chat.id;
      const data = JSON.parse(msg.web_app_data.data);
      
      // Generar ID de pedido
      const orderId = orderCounter++;
      const orderDate = new Date().toLocaleString('es-BO');
      
      // Guardar pedido
      orders.set(orderId, {
        id: orderId,
        chatId: chatId,
        user: data.user_name,
        items: data.items,
        total: data.total,
        date: orderDate,
        status: 'pending'
      });

      // Formatear mensaje del pedido
      let orderText = `✅ *Pedido #${orderId} Recibido*\n\n`;
      orderText += `👤 Cliente: ${data.user_name}\n`;
      orderText += `📅 Fecha: ${orderDate}\n\n`;
      orderText += `🍔 *Detalle del pedido:*\n`;
      
      data.items.forEach(item => {
        orderText += `• ${item.name} x${item.quantity} - Bs. ${item.price * item.quantity}\n`;
      });
      
      orderText += `\n💰 *Total: Bs. ${data.total}*\n\n`;
      orderText += `⏱️ Tiempo estimado de entrega: 30-45 minutos\n`;
      orderText += `\n_Te notificaremos cuando tu pedido esté en camino._`;

      // Enviar confirmación al cliente
      await bot.sendMessage(chatId, orderText, {
        parse_mode: 'Markdown'
      });

      // Notificar al administrador (opcional)
      // const ADMIN_CHAT_ID = 'TU_CHAT_ID';
      // await bot.sendMessage(ADMIN_CHAT_ID, `🔔 Nuevo pedido #${orderId} recibido!`);

      console.log(`✅ Pedido #${orderId} procesado correctamente`);
      
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      bot.sendMessage(msg.chat.id, 
        '❌ Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.'
      );
    }
  }
});

// Comando /pedidos - Ver pedidos del usuario
bot.onText(/Ver Mis Pedidos|\/pedidos/, async (msg) => {
  const chatId = msg.chat.id;
  const userOrders = Array.from(orders.values()).filter(o => o.chatId === chatId);

  if (userOrders.length === 0) {
    await bot.sendMessage(chatId, 'No tienes pedidos registrados.');
    return;
  }

  let response = '📋 *Tus Pedidos:*\n\n';
  userOrders.forEach(order => {
    const statusEmoji = order.status === 'pending' ? '⏳' : 
                       order.status === 'preparing' ? '👨‍🍳' :
                       order.status === 'delivering' ? '🚚' : '✅';
    
    response += `${statusEmoji} *Pedido #${order.id}*\n`;
    response += `Fecha: ${order.date}\n`;
    response += `Total: Bs. ${order.total}\n`;
    response += `Estado: ${getStatusText(order.status)}\n\n`;
  });

  await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
});

// Comando /ayuda
bot.onText(/Ayuda|\/ayuda|\/help/, async (msg) => {
  const helpText = `
❓ *Ayuda de SuperBurguer*

*Cómo hacer un pedido:*
1. Presiona "🍔 Hacer Pedido"
2. Selecciona tus hamburguesas
3. Presiona "Enviar Pedido"
4. ¡Listo! Recibirás una confirmación

*Comandos disponibles:*
/start - Iniciar el bot
/pedidos - Ver tus pedidos
/ayuda - Mostrar esta ayuda

*Tiempo de entrega:* 30-45 minutos
*Métodos de pago:* Efectivo en la entrega

¿Necesitas ayuda adicional?
Contáctanos: @tu_usuario
  `;

  await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
});

// API REST (opcional) para administración
app.get('/api/orders', (req, res) => {
  res.json(Array.from(orders.values()));
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.get(parseInt(req.params.id));
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.get(orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  const { status } = req.body;
  order.status = status;
  orders.set(orderId, order);

  // Notificar al cliente del cambio de estado
  const statusMessage = `
🔔 *Actualización de tu pedido #${orderId}*

${getStatusText(status)}

${status === 'delivering' ? 'Tu pedido está en camino! 🚚' : ''}
  `;

  try {
    await bot.sendMessage(order.chatId, statusMessage, { parse_mode: 'Markdown' });
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({ error: 'Error al notificar al cliente' });
  }
});

// Función auxiliar para obtener texto del estado
function getStatusText(status) {
  const statusTexts = {
    pending: '⏳ Pendiente',
    preparing: '👨‍🍳 En preparación',
    delivering: '🚚 En camino',
    delivered: '✅ Entregado'
  };
  return statusTexts[status] || status;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', orders: orders.size });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🤖 Bot de Telegram conectado`);
});

// Manejo de errores
bot.on('polling_error', (error) => {
  console.error('Error de polling:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Cerrando bot...');
  bot.stopPolling();
  process.exit();
});
