FROM node:21-alpine

WORKDIR /app

# SSL証明書の生成に必要なパッケージをインストール
RUN apk add --no-cache openssl

# 証明書ディレクトリの作成
RUN mkdir -p /app/certs

# 自己署名SSL証明書の生成（サーバーのドメイン名を使用）
ARG SERVER_DOMAIN=localhost
RUN openssl req -x509 -newkey rsa:4096 -keyout /app/certs/key.pem -out /app/certs/cert.pem -days 365 -nodes -subj "/CN=${SERVER_DOMAIN}"



# COPY package*.json .
COPY . .

RUN npm install

CMD ["./docker/run.sh"]
