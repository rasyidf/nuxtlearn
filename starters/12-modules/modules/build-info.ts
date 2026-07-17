import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'build-info' },
  setup(options, nuxt) {
    nuxt.hook('ready', () => {
      console.log('[build-info] Nuxt ready! Modules loaded:', nuxt.options.modules.length)
    })
  },
})
