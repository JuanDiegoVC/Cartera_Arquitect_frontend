# Configuración recomendada para Despliegue - Frontend SOTRAP

## 🖥️ Requisitos del Servidor

### SO Recomendado
- Ubuntu 22.04 LTS
- Debian 12
- RHEL 9

### Software Necesario
```bash
# Sistema
- Docker & Docker Compose
- Node.js 20 LTS
- Nginx (web server)
- Git

# CDN (opcional)
- CloudFlare
- AWS CloudFront
- Akamai
```

## 🐳 Configuración con Docker Compose

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    image: ghcr.io/owner/sotrap-frontend:latest
    container_name: sotrap_frontend
    environment:
      NODE_ENV: production
      VITE_API_URL: https://api.example.com/api
    ports:
      - "3000:3000"
    networks:
      - sotrap_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  sotrap_network:
    driver: bridge
```

## 🌐 Configuración Nginx

### /etc/nginx/sites-available/sotrap-frontend

```nginx
# Redirigir www a no-www
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    return 301 https://example.com$request_uri;
}

server {
    listen 80;
    server_name example.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
    gzip_min_length 1000;
    
    # Cache settings
    client_max_body_size 10M;
    
    # Root location
    root /opt/sotrap-frontend/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache busting for index.html
        if ($request_filename ~* ^.*?\.html?$) {
            add_header Cache-Control "public, max-age=3600";
        }
    }
    
    # Assets with hash (long cache)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API proxy
    location /api/ {
        proxy_pass https://api.example.com/api/;
        proxy_set_header Host api.example.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to hidden files/dirs
    location ~ /\. {
        return 404;
    }
}
```

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] SSL/TLS certificado válido (Let's Encrypt)
- [ ] Firewall configurado (UFW/iptables)
- [ ] Fail2ban instalado para SSH
- [ ] SSH key-based authentication únicamente
- [ ] Content Security Policy configurada
- [ ] X-Frame-Options configurado
- [ ] CORS correctamente configurado en backend
- [ ] Rate limiting configurado en Nginx
- [ ] Protección DDoS (CloudFlare/WAF)
- [ ] Monitoreo de logs habilitado
- [ ] Backups de código versionados
- [ ] Secrets no incluidos en código

## 🚀 Estrategias de Despliegue

### Blue-Green Deployment

```bash
# Terminal 1 - Versión "Blue" (actual)
docker-compose -f docker-compose.blue.yml up -d

# Terminal 2 - Versión "Green" (nueva)
docker-compose -f docker-compose.green.yml up -d

# Una vez probada, cambiar Nginx a apuntar a Green
# nginx -s reload

# Detener Blue
docker-compose -f docker-compose.blue.yml down
```

### Canary Deployment

```nginx
# 90% a versión estable, 10% a nueva versión
upstream frontend_stable {
    server 127.0.0.1:3000 weight=90;
}

upstream frontend_canary {
    server 127.0.0.1:3001 weight=10;
}

server {
    location / {
        proxy_pass http://frontend_stable;
        # proxy_pass http://frontend_canary; (para 10%)
    }
}
```

## 📊 Monitoreo

### Scripts de Healthcheck

```bash
#!/bin/bash
# healthcheck.sh

# Verificar frontend
curl -s -o /dev/null -w "%{http_code}" https://example.com/health | grep -q "200" || exit 1

# Verificar conectividad a API
curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health/ | grep -q "200" || exit 1

exit 0
```

### Monitoreo en tiempo real

Usar servicios como:
- Datadog
- New Relic
- Sentry (error tracking)
- LogRocket (session replay)
- UptimeRobot

## 📈 Performance Optimization

### Build Optimization

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'utils': ['axios', 'date-fns'],
        }
      }
    },
    sourcemap: false,  // Production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      }
    }
  }
}
```

### Image Optimization

- Usar WebP con fallback PNG
- Lazy load imágenes
- Responsive images (srcset)
- CDN para servir imágenes

### Code Splitting

- Lazy loading de rutas
- Dynamic imports
- Code splitting por página

## 🔄 CI/CD Integration

### Automatic Deployment

```bash
#!/bin/bash
# deploy-prod.sh

# Build
npm run build

# Push a registry
docker push ghcr.io/owner/sotrap-frontend:latest

# En servidor, pull e restart
ssh deploy@frontend.example.com << 'EOF'
  cd /opt/sotrap-frontend
  docker-compose pull
  docker-compose up -d
EOF
```

## 📋 Checklist de Despliegue

Antes de desplegar a producción:

- [ ] Tests pasan localmente
- [ ] Linting sin errores
- [ ] Build optimizado
- [ ] Environment variables configuradas
- [ ] API URL correcta
- [ ] SSL certificado válido
- [ ] DNS configurado
- [ ] Nginx configurado
- [ ] Healthcheck funciona
- [ ] Logs monitoreados
- [ ] Backups automáticos configurados
- [ ] Plan de rollback definido

## 🚨 Rollback

En caso de problema:

```bash
# Volver a versión anterior
docker-compose pull  # Fuerza pull de imagen anterior
docker-compose up -d

# O manualmente
docker run -d -p 3000:3000 ghcr.io/owner/sotrap-frontend:previous-tag
```

## 📞 Soporte

Para más información, ver:
- CI_CD_README.md
- SECRETS_SETUP.md
- Frontend README.md
