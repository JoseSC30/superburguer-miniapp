#!/usr/bin/env node

/**
 * Script de utilidades para SuperBurguer Mini App
 * Ejecutar con: node utils.js [comando]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
  'setup': setupProject,
  'clean': cleanProject,
  'test-build': testBuild,
  'check-deps': checkDependencies,
  'help': showHelp
};

function setupProject() {
  console.log('🚀 Configurando proyecto...\n');
  
  // Verificar Node.js
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch (e) {
    console.error('❌ Node.js no encontrado');
    return;
  }

  // Verificar npm
  try {
    const npmVersion = execSync('npm --version').toString().trim();
    console.log(`✅ npm: ${npmVersion}`);
  } catch (e) {
    console.error('❌ npm no encontrado');
    return;
  }

  // Instalar dependencias
  console.log('\n📦 Instalando dependencias...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas');
  } catch (e) {
    console.error('❌ Error al instalar dependencias');
    return;
  }

  // Crear .env si no existe
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) {
    console.log('\n📝 Creando archivo .env...');
    fs.writeFileSync(envFile, `# Telegram Mini App Configuration
REACT_APP_BOT_USERNAME=superburguer_bot
REACT_APP_API_URL=https://api.telegram.org
DISABLE_ESLINT_PLUGIN=false
SKIP_PREFLIGHT_CHECK=true
`);
    console.log('✅ Archivo .env creado');
  }

  console.log('\n✨ ¡Proyecto configurado correctamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('  1. Ejecuta: npm start');
  console.log('  2. Lee TELEGRAM_SETUP.md para configurar el bot');
  console.log('  3. Despliega en Vercel o similar\n');
}

function cleanProject() {
  console.log('🧹 Limpiando proyecto...\n');

  const dirsToRemove = ['node_modules', 'build', '.cache'];
  const filesToRemove = ['package-lock.json'];

  dirsToRemove.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`🗑️  Eliminando ${dir}...`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ ${dir} eliminado`);
    }
  });

  filesToRemove.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`🗑️  Eliminando ${file}...`);
      fs.unlinkSync(filePath);
      console.log(`✅ ${file} eliminado`);
    }
  });

  console.log('\n✨ Proyecto limpiado. Ejecuta "npm install" para reinstalar.\n');
}

function testBuild() {
  console.log('🔨 Probando build de producción...\n');

  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build exitoso!');
    
    // Verificar tamaño del build
    const buildDir = path.join(__dirname, 'build');
    if (fs.existsSync(buildDir)) {
      console.log('\n📊 Tamaño del build:');
      execSync('du -sh build/* 2>/dev/null || dir build', { stdio: 'inherit' });
    }
  } catch (e) {
    console.error('\n❌ Build falló');
    process.exit(1);
  }
}

function checkDependencies() {
  console.log('🔍 Verificando dependencias...\n');

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
  );

  console.log('📦 Dependencias principales:');
  Object.entries(packageJson.dependencies || {}).forEach(([name, version]) => {
    console.log(`  • ${name}: ${version}`);
  });

  console.log('\n🛠️  DevDependencies:');
  Object.entries(packageJson.devDependencies || {}).forEach(([name, version]) => {
    console.log(`  • ${name}: ${version}`);
  });

  // Verificar vulnerabilidades
  console.log('\n🔒 Verificando vulnerabilidades...');
  try {
    execSync('npm audit', { stdio: 'inherit' });
  } catch (e) {
    console.log('\n⚠️  Se encontraron vulnerabilidades. Ejecuta: npm audit fix');
  }
}

function showHelp() {
  console.log(`
🍔 SuperBurguer Mini App - Utilidades

Comandos disponibles:

  setup         Configura el proyecto completo
  clean         Limpia node_modules y archivos de build
  test-build    Prueba el build de producción
  check-deps    Verifica dependencias y vulnerabilidades
  help          Muestra esta ayuda

Uso:
  node utils.js [comando]

Ejemplos:
  node utils.js setup
  node utils.js clean
  node utils.js test-build

Para más información, consulta README.md o TELEGRAM_SETUP.md
  `);
}

// Ejecutar comando
const command = process.argv[2] || 'help';
const commandFn = commands[command];

if (commandFn) {
  commandFn();
} else {
  console.error(`❌ Comando desconocido: ${command}`);
  console.log('Ejecuta "node utils.js help" para ver comandos disponibles.\n');
  process.exit(1);
}
