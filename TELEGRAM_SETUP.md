# Configuración del Bot de Telegram para SuperBurguer Mini App

## 1. Crear el Bot

1. Abre Telegram y busca [@BotFather](https://t.me/botfather)
2. Envía el comando `/newbot`
3. Sigue las instrucciones para nombrar tu bot
4. Guarda el token que te proporciona

## 2. Crear la Mini App

1. Con @BotFather, envía `/newapp`
2. Selecciona el bot que acabas de crear
3. Proporciona:
   - **Título:** SuperBurguer
   - **Descripción:** Las mejores hamburguesas a tu puerta
   - **Foto:** Sube una imagen de hamburguesa (512x512 px recomendado)
   - **Demo GIF/Video:** (opcional)
   - **URL:** La URL donde desplegaste la aplicación (ej: https://superburguer.vercel.app)

## 3. Configurar el Webhook (Backend)

Para recibir los pedidos, necesitas un backend que maneje el webhook de Telegram.

### Ejemplo con Node.js:

```javascript
const TelegramBot = require('node-telegram-bot-api');
const token = 'TU_TOKEN_DEL_BOT';
const bot = new TelegramBot(token, { polling: true });

// Manejar datos de la Mini App
bot.on('message', (msg) => {
  if (msg.web_app_data) {
    const data = JSON.parse(msg.web_app_data.data);
    const chatId = msg.chat.id;
    
    // Formatear el pedido
    let orderText = `🍔 *Nuevo Pedido de ${data.user_name}*\n\n`;
    data.items.forEach(item => {
      orderText += `• ${item.name} x${item.quantity} - Bs. ${item.price * item.quantity}\n`;
    });
    orderText += `\n*Total: Bs. ${data.total}*`;
    
    // Enviar confirmación al cliente
    bot.sendMessage(chatId, orderText, { parse_mode: 'Markdown' });
    
    // Aquí puedes guardar el pedido en tu base de datos
    console.log('Pedido recibido:', data);
  }
});

// Comando para abrir la Mini App
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '¡Bienvenido a SuperBurguer! 🍔', {
    reply_markup: {
      keyboard: [[{
        text: '🍔 Hacer Pedido',
        web_app: { url: 'https://superburguer.vercel.app' }
      }]],
      resize_keyboard: true
    }
  });
});
```

### Instalar dependencias:

```bash
npm install node-telegram-bot-api
```

## 4. Probar la Mini App

1. Busca tu bot en Telegram
2. Envía `/start`
3. Presiona el botón "🍔 Hacer Pedido"
4. La Mini App se abrirá dentro de Telegram

## 5. Variables de Entorno

Actualiza el archivo `.env` con la información de tu bot:

```env
REACT_APP_BOT_USERNAME=tu_bot_username
REACT_APP_API_URL=https://api.telegram.org
```

## 6. Comandos Útiles del Bot

Configura estos comandos con @BotFather usando `/setcommands`:

```
start - Iniciar el bot y ver el menú
menu - Ver el catálogo de hamburguesas
pedido - Ver el estado de tu pedido
ayuda - Obtener ayuda
```

## 7. Personalización

### Colores del tema:

En `src/App.js`, puedes personalizar los colores:

```javascript
if (tg.setHeaderColor) {
  tg.setHeaderColor('#fb923c'); // Color del header
}
if (tg.setBackgroundColor) {
  tg.setBackgroundColor('#fb923c'); // Color de fondo
}
```

### Productos:

Modifica el array `burgers` en `src/App.js` para añadir o modificar productos.

## 8. Seguridad

Para validar que los datos vienen de Telegram:

```javascript
const crypto = require('crypto');

function validateTelegramData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

## 9. Recursos Adicionales

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Documentación de Mini Apps](https://core.telegram.org/bots/webapps)

## 10. Solución de Problemas

### La app no se abre en Telegram:
- Verifica que la URL sea HTTPS
- Asegúrate de que el archivo `vercel.json` tenga los headers correctos
- Prueba la URL directamente en el navegador

### El botón "Enviar Pedido" no funciona:
- Verifica que el backend esté configurado para recibir datos
- Revisa la consola del navegador para errores
- Asegúrate de que el bot esté ejecutándose

### Los estilos no se cargan:
- Ejecuta `npm run build` nuevamente
- Verifica que Tailwind CSS esté instalado correctamente
- Limpia la caché del navegador
