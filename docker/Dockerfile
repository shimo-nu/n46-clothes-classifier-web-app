FROM node:18-alpine

WORKDIR /app

# Auth0環境変数の設定
ENV VUE_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
ENV VUE_APP_AUTH0_CLIENT_ID=your-auth0-client-id
ENV VUE_APP_AUTH0_AUDIENCE=your-auth0-api-identifier

# COPY package*.json .
COPY . .

RUN npm install
RUN npm install @auth0/auth0-vue
RUN npm install vuetify

CMD ["./docker/run.sh"]
