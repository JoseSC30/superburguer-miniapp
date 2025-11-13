# 🍔 SuperBurguer Mini App

Mini aplicación de Telegram para pedir hamburguesas desarrollada con React y Tailwind CSS.

## 🚀 Características

- ✅ Integración completa con Telegram WebApp API
- 🛒 Carrito de compras interactivo
- 💳 Botón principal de Telegram para enviar pedidos
- 🎨 Interfaz moderna con Tailwind CSS
- 📱 Diseño responsive y optimizado para móviles
- 🔄 Actualización en tiempo real del total

## 🛠️ Tecnologías

- React 19
- Tailwind CSS 3
- Lucide React (iconos)
- Telegram WebApp API

## 📦 Instalación

```bash
npm install
```

## 🏃‍♂️ Desarrollo

Para ejecutar en modo desarrollo:

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000).

**Nota:** Para probar la integración completa con Telegram, necesitas desplegarla y configurarla en un bot de Telegram.

## 🏗️ Build

Para construir la aplicación para producción:

```bash
npm run build
```

## 🌐 Despliegue en Vercel

1. Sube el proyecto a GitHub
2. Importa el repositorio en Vercel
3. Vercel detectará automáticamente la configuración de Create React App
4. Copia la URL de despliegue

## 🤖 Configuración del Bot de Telegram

1. Crea un bot con [@BotFather](https://t.me/botfather)
2. Usa el comando `/newapp` para crear una Mini App
3. Proporciona la URL de tu aplicación desplegada
4. Configura el bot para recibir los datos del pedido

## 📱 Uso

1. Los usuarios abren el bot en Telegram
2. Presionan el botón "🍔 Hacer Pedido"
3. La Mini App se abre dentro de Telegram
4. Seleccionan hamburguesas y cantidades
5. Presionan el botón de Telegram "Enviar Pedido"
6. Reciben confirmación del pedido

## 📚 Documentación Adicional

- **[TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)** - Guía completa de configuración del bot
- **[CHANGELOG.md](./CHANGELOG.md)** - Registro de cambios y correcciones
- **[server-example.js](./server-example.js)** - Ejemplo de backend para el bot

## 🔧 Servidor Backend (Opcional)

Para procesar los pedidos, necesitas un backend. Hemos incluido un ejemplo completo:

```bash
# Instalar dependencias del servidor
npm install --prefix . express node-telegram-bot-api cors dotenv

# Configurar variables de entorno
cp .env.server .env

# Editar .env con tu token del bot
# BOT_TOKEN=tu_token_aqui

# Ejecutar servidor
node server-example.js
```

Ver el archivo `TELEGRAM_SETUP.md` para más detalles.

## 🎨 Personalización

### Cambiar productos

Edita el array `burgers` en `src/App.js`:

```javascript
const burgers = [
  { id: 1, name: 'Tu Hamburguesa', price: 25, desc: 'Descripción' },
  // Agregar más...
];
```

### Cambiar colores

Modifica los colores en `src/App.js`:

```javascript
if (tg.setHeaderColor) {
  tg.setHeaderColor('#tu-color'); // Color del header
}
```

O edita las clases de Tailwind en el JSX.

## 🐛 Solución de Problemas

### La app no compila
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tailwind CSS no funciona
Verifica que `src/index.css` contenga:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### El botón de Telegram no aparece
- Verifica que la app esté desplegada en HTTPS
- Revisa los headers en `vercel.json`
- Asegúrate de haber configurado correctamente el bot

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Proyecto desarrollado para demostración de Telegram Mini Apps.

## 🙏 Agradecimientos

- Telegram por la API de Mini Apps
- React y Tailwind CSS por las herramientas
- Lucide React por los iconos

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
