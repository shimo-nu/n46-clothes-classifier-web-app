# nogi-clothes-classification

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Environment Variables

Create a `.env` file with the following keys:

```sh
VITE_API_BASE_URL=<backend url>
VITE_AUTH0_DOMAIN=<auth0 domain>
VITE_AUTH0_CLIENT_ID=<auth0 client id>
VITE_AUTH0_AUDIENCE=<auth0 audience>
VITE_AUTH0_REDIRECT_URI=<redirect uri>
VITE_AUTH0_ROLES_CLAIM=<roles claim key>
```
