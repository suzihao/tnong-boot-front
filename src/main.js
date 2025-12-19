import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { permDirective } from './utils/permission'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 注册权限指令
app.directive('perm', permDirective)

app.mount('#app')
