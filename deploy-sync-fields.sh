#!/bin/bash

# Deploy Script: Nuevos Campos de Sincronización para EasyPanel
# Autor: Paulo
# Fecha: 28 Julio 2025

set -e  # Exit on any error

echo "🚀 Iniciando despliegue de nuevos campos de sincronización..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [[ ! -d "kars-api" ]] || [[ ! -d "kars-react" ]]; then
    error "Este script debe ejecutarse desde el directorio raíz del proyecto"
fi

log "Verificando dependencias..."

# Verificar Node.js y npm
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
fi

if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
fi

# Verificar Prisma CLI
if ! command -v npx &> /dev/null; then
    error "npx no está disponible"
fi

success "Dependencias verificadas"

# 1. BACKUP DE BASE DE DATOS (opcional, comentado para EasyPanel)
log "Paso 1: Backup de base de datos"
warning "RECORDATORIO: Haz backup manual de la base de datos en EasyPanel si es necesario"
read -p "¿Has hecho backup de la base de datos? (y/n): " backup_confirm
if [[ $backup_confirm != "y" ]]; then
    warning "Por favor haz backup antes de continuar"
    exit 1
fi

# 2. BACKEND - Migración de Base de Datos
log "Paso 2: Migrando base de datos (Backend)"
cd kars-api

# Verificar que existe el archivo .env
if [[ ! -f ".env" ]]; then
    error "Archivo .env no encontrado en kars-api/"
fi

log "Aplicando migración de Prisma..."
npx prisma db push || error "Error al aplicar migración de base de datos"
success "Migración de base de datos completada"

log "Regenerando cliente de Prisma..."
npx prisma generate || error "Error al generar cliente de Prisma"
success "Cliente de Prisma regenerado"

# 3. BACKEND - Build y preparación
log "Paso 3: Construyendo backend"

log "Instalando dependencias del backend..."
npm ci || error "Error al instalar dependencias del backend"

log "Construyendo backend..."
npm run build || error "Error al construir backend"
success "Backend construido exitosamente"

# 4. FRONTEND - Build y preparación
log "Paso 4: Construyendo frontend"
cd ../kars-react

log "Instalando dependencias del frontend..."
npm ci || error "Error al instalar dependencias del frontend"

log "Ejecutando lint..."
npm run lint || warning "Lint encontró problemas (continuando)"

log "Construyendo frontend..."
npm run build || error "Error al construir frontend"
success "Frontend construido exitosamente"

# 5. Verificaciones pre-despliegue
log "Paso 5: Verificaciones pre-despliegue"

# Verificar que los archivos de build existen
if [[ ! -d "dist" ]]; then
    error "Directorio dist/ no encontrado en frontend"
fi

if [[ ! -d "../kars-api/dist" ]] && [[ ! -f "../kars-api/package.json" ]]; then
    warning "Verificar que el backend esté listo para despliegue"
fi

success "Verificaciones pre-despliegue completadas"

# 6. Instrucciones para EasyPanel
log "Paso 6: Instrucciones para EasyPanel"

echo ""
echo "🎯 INSTRUCCIONES PARA EASYPANEL:"
echo "================================="
echo ""
echo "BACKEND (kars-api):"
echo "1. En EasyPanel, ve al servicio del backend"
echo "2. Sube el código actualizado o conecta con Git"
echo "3. EasyPanel ejecutará automáticamente:"
echo "   - npm ci"
echo "   - npm run build"
echo "   - npm start"
echo ""
echo "FRONTEND (kars-react):"
echo "1. En EasyPanel, ve al servicio del frontend"
echo "2. Sube el código actualizado o conecta con Git"
echo "3. EasyPanel ejecutará automáticamente:"
echo "   - npm ci"
echo "   - npm run build"
echo "   - Servirá los archivos estáticos desde dist/"
echo ""
echo "VARIABLES DE ENTORNO:"
echo "- Asegúrate de que DATABASE_URL esté configurada"
echo "- Verifica VITE_API_BASE_URL en el frontend"
echo ""

# 7. Comandos de verificación post-despliegue
echo "🔍 VERIFICACIÓN POST-DESPLIEGUE:"
echo "================================"
echo ""
echo "1. Verificar API responde:"
echo "   curl -f https://tu-backend.easypanel.app/api/vehicles?page=1&per_page=1"
echo ""
echo "2. Verificar que incluye nuevos campos en la respuesta:"
echo "   Buscar: \"motorIdSync\": null, \"buscoIdSync\": null"
echo ""
echo "3. Probar sincronización:"
echo "   - Ir al panel admin"
echo "   - Sincronizar un vehículo"
echo "   - Verificar que el botón cambia de estado"
echo ""
echo "4. Verificar logs en EasyPanel:"
echo "   - Backend: Revisar logs del servicio"
echo "   - Frontend: Verificar en consola del navegador"
echo ""

# 8. Checklist final
echo "✅ CHECKLIST FINAL:"
echo "=================="
echo "□ Código del backend subido a EasyPanel"
echo "□ Código del frontend subido a EasyPanel"
echo "□ Servicios reiniciados en EasyPanel"
echo "□ API responde correctamente"
echo "□ Frontend carga sin errores"
echo "□ Sincronización funciona"
echo "□ Botones cambian de estado"
echo "□ No hay errores en logs"
echo ""

success "🎉 Script de preparación completado!"
echo ""
warning "SIGUIENTE PASO: Subir código a EasyPanel y seguir las instrucciones mostradas arriba"

# Regresar al directorio raíz
cd ..

echo ""
echo "📁 Archivos listos para despliegue:"
echo "- Backend: kars-api/ (listo para EasyPanel)"
echo "- Frontend: kars-react/dist/ (construido)"
echo "- Documentación: DEPLOYMENT_SYNC_FIELDS.md"
echo ""