import { isFunction, omit, isString, pickBy } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { h } from 'vue'
import { RouterLink } from 'vue-router'

import type { MenuMixedOptions, MenuOption } from './interface'
import type { MenuProps } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'

export function resolveMenu(options: MenuMixedOptions[], parentDisabled = false) {
  const menuOptions: MenuProps['options'] = []

  options.forEach((item) => {
    if (!item.type || item.type === 'group') {
      const { children, name, path, label, icon, key, disabled, extra, props, show, type } =
        item as MenuOption

      const mergedDisabled = parentDisabled || disabled

      const renderIcon = icon
        ? isFunction(icon)
          ? icon
          : () => h('span', { class: `${icon}` })
        : null

      const menu = pickBy(
        {
          key: key || name || path,
          icon: renderIcon,
          label,
          disabled,
          extra,
          props,
          show,
          type,
          name,
        },
        (v) => v !== undefined,
      ) as NonNullable<MenuProps['options']>[number]

      if (Array.isArray(children) && !isEmpty(children)) {
        menu.children = resolveMenu(children, mergedDisabled)
      } else {
        menu.label =
          mergedDisabled || isFunction(label)
            ? label
            : () => h(RouterLink, { to: { name } }, { default: () => label })
      }

      menuOptions.push(menu)
    } else {
      menuOptions.push(item)
    }
  })

  return menuOptions
}

export function resolveRoute(options: MenuMixedOptions[]) {
  const modules = import.meta.glob('@/views/**/*.vue')

  console.log('resolveRoute - 可用的模块:', Object.keys(modules))

  const routeOptions: RouteRecordRaw[] = []

  options.forEach((item) => {
    // 跳过分隔符和分组类型
    if (item.type === 'divider') {
      return
    }

    // 如果是分组类型，递归处理子项
    if (item.type === 'group' && Array.isArray(item.children) && !isEmpty(item.children)) {
      routeOptions.push(...resolveRoute(item.children))
      return
    }

    const { label, icon, meta, component, children, disabled, ...rest } = item as MenuOption

    if (!disabled) {
      let componentModule: (() => Promise<unknown>) | null = null

      if (!isEmpty(component) && isString(component)) {
        const extractName = component.replace(/^\/|\.vue$/g, '')

        // 尝试多种路径格式
        const possiblePaths = [
          `/src/views/${extractName}.vue`,           // system/user.vue
          `/src/views/${extractName}/index.vue`,     // system/user/index.vue
        ]

        console.log('resolveRoute - 查找组件:', { component, extractName, possiblePaths })

        for (const modulePath of possiblePaths) {
          if (modules[modulePath]) {
            componentModule = modules[modulePath]
            console.log('resolveRoute - 找到组件:', modulePath)
            break
          }
        }

        if (!componentModule) {
          console.warn('resolveRoute - 组件不存在，尝试的路径:', possiblePaths)
        }
      }

      const route = omit(
        {
          ...rest,
          ...(componentModule ? { component: componentModule } : {}),
          meta: {
            ...meta,
            title: meta?.title || label,
            icon,
          },
        },
        ['type', 'label', 'icon', 'disabled', 'extra', 'props', 'show', 'key'],
      ) as RouteRecordRaw

      // 递归处理子路由
      if (Array.isArray(children) && !isEmpty(children)) {
        route.children = resolveRoute(children)
      }

      console.log('resolveRoute - 生成路由:', { name: route.name, path: route.path, hasComponent: !!route.component, hasChildren: !!route.children?.length })

      routeOptions.push(route)
    }
  })

  return routeOptions
}
