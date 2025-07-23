import { config } from '@vue/test-utils'

// Mock des modules externes
config.global.mocks = {
  $router: {
    push: vi.fn(),
    replace: vi.fn()
  },
  $route: {
    path: '/',
    params: {},
    query: {}
  }
}

// Mock des APIs Web
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn()
})
