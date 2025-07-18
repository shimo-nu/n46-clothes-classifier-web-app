import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'

import App from './App.vue'
import router from './router'
import { auth0Config } from './auth/auth0-config'

import { createVuetify } from 'vuetify';
import 'vuetify/styles'; 
// import '@mdi/font/css/materialdesignicons.css'; 
import { aliases, mdi } from 'vuetify/iconsets/mdi'; 

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

const app = createApp(App)

app.use(createPinia())
app.use(createAuth0(auth0Config))
app.use(router)
app.use(vuetify)

app.mount('#app')
