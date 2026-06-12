#!/usr/bin/bashio

echo "Avvio dell'Add-on Solar EV Control..."

export NODE_ENV=production
export PORT=3000

# Esegui il server backend (express) compilato
node dist/server.cjs
