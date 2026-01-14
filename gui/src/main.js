/*
   Copyright 2023 Nederlandse Organisatie voor Toegepast Natuur-
   wetenschappelijk Onderzoek TNO / TNO, Netherlands Organisation for 
   applied scientific research

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import { createApp } from "vue";
import { Quasar, Notify } from "quasar";
import quasarIconSet from "quasar/icon-set/mdi-v6";
import { store } from "./store";

// Import icon libraries
import "@quasar/extras/mdi-v6/mdi-v6.css";

// Import Quasar css
import "quasar/dist/quasar.css";

import './style.css'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from "./App.vue";

const myApp = createApp(App);
myApp.use(store);

myApp.use(Quasar, {
  plugins: {
    Notify,
  }, // import Quasar plugins and add here
  iconSet: quasarIconSet,
});

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount("#app");
