import { createRouter, createWebHistory } from 'vue-router'

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/sign-in', name: 'signIn', component: () => import('@/views/sign-in/index.vue') },
  {
    path: '/wecom-callback',
    name: 'wecomCallback',
    component: () => import('@/views/wecom-callback/index.vue'),
  },
  {
    path: '/no-permission',
    name: 'noPermission',
    component: () => import('@/views/no-permission/index.vue'),
  },
  {
    name: 'errorPage',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error-page/index.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  strict: true,
})

export default router
