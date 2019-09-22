import Vue from 'vue'
import App from './App.vue'
import vueAwesomeCountdown from 'vue-awesome-countdown'

Vue.config.productionTip = false;
Vue.use(vueAwesomeCountdown, 'vac');

new Vue({
  render: h => h(App),
}).$mount('#app');
