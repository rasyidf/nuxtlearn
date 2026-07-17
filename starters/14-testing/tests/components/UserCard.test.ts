import { describe, it, expect } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import UserCard from '~/components/UserCard.vue'

mockNuxtImport('useFetch', () => {
  return () => ({
    data: ref({ id: 1, name: 'Test User', email: 'test@example.com' }),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })
})

describe('UserCard', () => {
  it('renders user data', async () => {
    const wrapper = await mountSuspended(UserCard, { props: { userId: 1 } })
    expect(wrapper.text()).toContain('Test User')
    expect(wrapper.text()).toContain('test@example.com')
  })
})
