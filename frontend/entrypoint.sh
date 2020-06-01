#!/bin/bash
echo "[Configurando URls]"
cat /usr/share/nginx/html/assets/app-settings/appsettings.json | jq ".backendUrl=\"$backendUrl\"" > /tmp/appsettings.json
cat /tmp/appsettings.json > /usr/share/nginx/html/assets/app-settings/appsettings.json

nginx -g 'daemon off;'

  
  