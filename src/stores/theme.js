import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')
  const colorScheme = ref(localStorage.getItem('colorScheme') || 'green')
  
  if (typeof window !== 'undefined') {
    const htmlEl = document.documentElement
    if (isDark.value) {
      htmlEl.classList.add('dark')
    } else {
      htmlEl.classList.remove('dark')
    }
  }
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    if (typeof window !== 'undefined') {
      const htmlEl = document.documentElement
      if (isDark.value) {
        htmlEl.classList.add('dark')
      } else {
        htmlEl.classList.remove('dark')
      }
    }
  }
  
  const setColorScheme = (scheme) => {
    colorScheme.value = scheme
    localStorage.setItem('colorScheme', scheme)
  }

  const themeOverrides = computed(() => {
    const presets = {
      green: {
        common: {
          primaryColor: '#18a058',
          primaryColorHover: '#36ad6a',
          primaryColorPressed: '#0c7a43',
          primaryColorSuppl: '#36ad6a'
        }
      },
      red: {
        common: {
          primaryColor: '#d03050',
          primaryColorHover: '#de576d',
          primaryColorPressed: '#ab1f3f',
          primaryColorSuppl: '#de576d'
        }
      },
      blue: {
        common: {
          primaryColor: '#2080f0',
          primaryColorHover: '#4098fc',
          primaryColorPressed: '#1060c9',
          primaryColorSuppl: '#4098fc'
        }
      }
    }
    return presets[colorScheme.value] || presets.green
  })

  return {
    isDark,
    colorScheme,
    toggleTheme,
    setColorScheme,
    themeOverrides
  }
})
