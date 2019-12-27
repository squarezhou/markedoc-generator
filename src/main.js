import Vue from 'vue'
import App from './App.vue'
import './plugins/element'
import './plugins/axios'
import './plugins/lodash'
import './plugins/clipboard'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
