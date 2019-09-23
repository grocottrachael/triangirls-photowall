import Vue from 'vue'

const BASE_URL = "https://or2ba7te07.execute-api.eu-west-2.amazonaws.com/dev";
const PUSHER_APP_ID = "a3e66f033b1c7a3c239d";

import vueAwesomeCountdown from 'vue-awesome-countdown'

Vue.config.productionTip = false;
Vue.use(vueAwesomeCountdown, 'vac');


import Uploader from './pages/Uploader'
import Wall from './pages/Wall'
import NotFound from './pages/NotFound'

const routes = {
  '/': Wall,
  '/upload': Uploader
};

new Vue({
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute] || NotFound
    }
  },
  render (h) { return h(this.ViewComponent, {
    props: {
      baseUrl: BASE_URL,
      pusherAppId: PUSHER_APP_ID
    }
  })}
}).$mount('#app');
