#!/bin/sh

# npm install -g nodemon

# nodemon --watch . --exec "npm start"

# vue add vuetify

# 証明書が存在しない場合は生成
if [ ! -f /app/certs/key.pem ] || [ ! -f /app/certs/cert.pem ]; then
  openssl req -x509 -newkey rsa:4096 -keyout /app/certs/key.pem -out /app/certs/cert.pem -days 365 -nodes -subj "/CN=192.168.207.227"
  chmod 644 /app/certs/key.pem /app/certs/cert.pem
fi

# 開発サーバーを起動
exec npm run dev -- --host 0.0.0.0
# /bin/bash
