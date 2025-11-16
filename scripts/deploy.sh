#!/bin/bash
# Deploy script para uso manual en CI/CD pipeline
# Este script facilita el despliegue automatizado del frontend

set -e  # Exit si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
DEPLOY_HOST="${1:-$DEPLOY_HOST}"
DEPLOY_USER="${2:-$DEPLOY_USER}"
DEPLOY_KEY_FILE="${3:-.ssh/deploy_key}"
APP_DIR="/opt/sotrap-frontend"

# Función para imprimir
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Validar argumentos
if [ -z "$DEPLOY_HOST" ]; then
    print_error "DEPLOY_HOST no configurado"
    exit 1
fi

if [ -z "$DEPLOY_USER" ]; then
    print_error "DEPLOY_USER no configurado"
    exit 1
fi

# Verificar clave SSH
if [ ! -f "$DEPLOY_KEY_FILE" ]; then
    print_error "Clave SSH no encontrada: $DEPLOY_KEY_FILE"
    exit 1
fi

chmod 600 "$DEPLOY_KEY_FILE"

print_info "Conectando a $DEPLOY_USER@$DEPLOY_HOST..."

# Desplegar
ssh -i "$DEPLOY_KEY_FILE" -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" << 'EOF'
    set -e
    
    print_status() {
        echo -e "\033[0;32m[✓]\033[0m $1"
    }
    
    print_error() {
        echo -e "\033[0;31m[✗]\033[0m $1"
    }
    
    print_info() {
        echo -e "\033[1;33m[i]\033[0m $1"
    }
    
    print_info "Iniciando despliegue de frontend..."
    
    # Actualizar código
    print_info "Actualizando código..."
    cd /opt/sotrap-frontend
    git pull origin main
    
    # Instalar dependencias
    print_info "Instalando dependencias..."
    npm ci
    
    # Construir aplicación
    print_info "Construyendo aplicación..."
    npm run build
    
    # Detener servicio actual (si es Nginx)
    print_info "Restarting web server..."
    sudo systemctl restart nginx || true
    
    print_status "Despliegue de frontend completado exitosamente"
EOF

print_status "Despliegue completado"
