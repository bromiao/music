// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import 'babel-polyfill'
import fastclick from 'fastclick'
import lazyload from 'vue-lazyload'

import MetaInfo from 'vue-meta-info'

Vue.config.productionTip = false

Vue.config.devtools = true //开启，用于网页调试

fastclick.attach(document.body) //去除点击body内容时的300ms延时

Vue.use(lazyload, {
    loading: require('common/img/default.png')
})

Vue.use(MetaInfo)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
    mounted() {
        document.dispatchEvent(new Event('render-event'))
    }
})
