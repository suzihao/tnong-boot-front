import { isEmpty } from 'es-toolkit/compat'

import { useEventBus } from '@/event-bus'
import { useUserStore, toRefsUserStore } from '@/stores'

import type { Router } from 'vue-router'

const Layout = () => import('@/layout/index.vue')

export function setupRouterGuard(router: Router) {
  const { resolveMenuRoute, cleanup } = useUserStore()

  const { token } = toRefsUserStore()
  const { routerEventBus } = useEventBus()

  router.beforeEach(async (to, from, next) => {
    routerEventBus.emit('beforeEach')

    console.log('路由守卫 - 目标路由:', to.path, '当前token:', !!token.value)

    // 企业微信回调页面，直接放行
    if (to.name === 'wecomCallback') {
      next()
      return false
    }

    // 无权限页面，直接放行
    if (to.name === 'noPermission') {
      next()
      return false
    }

    if (to.name === 'signIn') {
      if (!token.value) {
        next()
      } else {
        next(from.fullPath)
      }

      return false
    }

    if (!token.value) {
      console.log('路由守卫 - 未登录，跳转到登录页')
      cleanup()
      next()
      return false
    }

    if (token.value && !router.hasRoute('layout')) {
      console.log('路由守卫 - 已登录但未注册layout路由，开始注册动态路由')
      try {
        // 从 store 中获取已经加载的路由列表
        const userStore = useUserStore()
        let { routeList } = userStore

        // 如果路由列表为空，则重新获取菜单和权限
        if (isEmpty(routeList)) {
          console.log('路由守卫 - 路由列表为空，重新获取菜单权限')
          await userStore.fetchMenusAndPerms()
          routeList = userStore.routeList
        }

        console.log('路由守卫 - 获取到的路由列表:', routeList)

        if (isEmpty(routeList)) {
          console.warn('路由守卫 - 路由列表为空，用户暂无菜单权限，跳转到无权限页面')
          // 保持登录状态，但跳转到无权限提示页面
          next('/no-permission')
          return false
        }

        // 找到第一个可访问的路由作为默认重定向
        // 需要找到第一个有组件的叶子路由
        function findFirstLeafRoute(routes: any[]): any {
          for (const route of routes) {
            if (route.children && route.children.length > 0) {
              const childRoute = findFirstLeafRoute(route.children)
              if (childRoute) {
                // 返回完整路径
                return {
                  ...childRoute,
                  fullPath: route.path + '/' + childRoute.path
                }
              }
            } else if (route.component) {
              return route
            }
          }
          return null
        }

        const firstLeafRoute = findFirstLeafRoute(routeList)
        const redirectPath = firstLeafRoute?.fullPath || firstLeafRoute?.path || '/dashboard'

        console.log('路由守卫 - 第一个叶子路由:', firstLeafRoute)
        console.log('路由守卫 - 重定向路径:', redirectPath)

        // 添加知识库编辑器动态路由（支持多Tab）
        const editorRoute = {
          path: 'knowledge/editor/:id?',
          name: 'knowledgeEditor',
          component: () => import('@/views/knowledge/editor.vue'),
          meta: {
            componentName: 'KnowledgeEditor',
            title: '知识库',
            showTab: true,
            enableMultiTab: true,
            renderTabTitle(params: any) {
              const { id } = params
              return id ? `编辑文档-${id}` : '新建文档'
            },
          },
        }

        router.addRoute({
          path: '/',
          name: 'layout',
          component: Layout,
          redirect: redirectPath,
          children: [...routeList, editorRoute],
        })

        console.log('路由守卫 - 动态路由注册完成')
        console.log('路由守卫 - 所有路由:', router.getRoutes().map(r => ({ name: r.name, path: r.path })))
        console.log('路由守卫 - 重新导航到:', to.fullPath)
        next(to.fullPath)
      } catch (error) {
        console.error('路由守卫 - 解析路由出错:', error)
        cleanup()
        next()
      }

      return false
    }

    console.log('路由守卫 - 正常放行')
    next()
    return false
  })

  router.beforeResolve((_, __, next) => {
    next()
  })

  router.afterEach(() => {
    routerEventBus.emit('afterEach')
  })
}
