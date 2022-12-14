import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

import './assets/fonts/iconfont.css'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


Vue.prototype.$http = axios
//配置请求的根路径
axios.defaults.baseURL= 'http://127.0.0.1:8888/api/private/v1/'
//为axios设置拦截器
axios.interceptors.request.use(config=>{
  //将token绑定到headers字段中的authorization这个属性里面
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return config
  return config;
})

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)
//将富文本编辑器注册为全局可用的属性
Vue.use(VueQuillEditor)
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() +1 +'').padStart(2,'0')
  const d = (dt.getDay() +'').padStart(2,'0')

  const hh = (dt.getHours() +'').padStart(2,'0')
  const mm =(dt.getMinutes() +'').padStart(2,'0')
  const ss =(dt.getSeconds() +'').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
