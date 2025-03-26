import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//引入全局样式文件
import './assets/css/global.less'
import axios from 'axios'
import SocketService from './utils/socket_service'

//引入字体文件
import './assets/font/iconfont.css'
//对服务端进行websocket的连接
//Instance 是get请求的，所以调用这个方法不用加（）
SocketService.Instance.connect()
//其他的组件就可以通过this.$scoket 得到SocketService 这个类
Vue.prototype.$socket = SocketService.Instance
// 配置基准路径
axios.defaults.baseURL = 'http://localhost:8888/api'
//将axios挂载到vue的原型对像上  在别的组件是this.$http
Vue.prototype.$http = axios


// 将全局的echarts对象挂载到vue原型上  别的组件用this.echarts
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
