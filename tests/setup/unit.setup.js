import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false,
    };
  },
}));

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock React Native components
jest.mock('react-native', () => ({
  View: ({ children, testID, ...props }) => 
    React.createElement('div', { 'data-testid': testID, ...props }, children),
  Text: ({ children, testID, ...props }) => 
    React.createElement('span', { 'data-testid': testID, ...props }, children),
  TouchableOpacity: ({ children, onPress, testID, ...props }) =>
    React.createElement('button', { 
      onClick: onPress, 
      'data-testid': testID, 
      ...props 
    }, children),
  ScrollView: ({ children, testID, ...props }) =>
    React.createElement('div', { 'data-testid': testID, ...props }, children),
  FlatList: ({ data, renderItem, testID, ...props }) =>
    React.createElement('div', { 'data-testid': testID, ...props }, 
      data?.map((item, index) => renderItem({ item, index }))
    ),
  Image: ({ source, testID, ...props }) =>
    React.createElement('img', { 
      src: source?.uri || source, 
      'data-testid': testID, 
      ...props 
    }),
  TextInput: ({ value, onChangeText, testID, ...props }) =>
    React.createElement('input', {
      value,
      onChange: (e) => onChangeText?.(e.target.value),
      'data-testid': testID,
      ...props
    }),
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  Alert: {
    alert: jest.fn(),
  },
  StatusBar: {
    setBarStyle: jest.fn(),
    setHidden: jest.fn(),
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 667 }),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: ({ children, ...props }) => 
    React.createElement('svg', props, children),
  Circle: (props) => React.createElement('circle', props),
  Path: (props) => React.createElement('path', props),
  Rect: (props) => React.createElement('rect', props),
  G: ({ children, ...props }) => 
    React.createElement('g', props, children),
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children, href, ...props }) =>
    React.createElement('a', { href, ...props }, children),
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    getSession: jest.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    }),
    signUp: jest.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signInWithPassword: jest.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ 
        data: { publicUrl: 'https://example.com/test.jpg' } 
      }),
    })),
  },
  functions: {
    invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
  realtime: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn().mockReturnThis(),
    })),
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock Recharts (for analytics components)
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => React.createElement('div', { 'data-testid': 'line-chart' }, children),
  BarChart: ({ children }) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  AreaChart: ({ children }) => React.createElement('div', { 'data-testid': 'area-chart' }, children),
  PieChart: ({ children }) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Line: () => React.createElement('div', { 'data-testid': 'line' }),
  Bar: () => React.createElement('div', { 'data-testid': 'bar' }),
  Area: () => React.createElement('div', { 'data-testid': 'area' }),
  Pie: () => React.createElement('div', { 'data-testid': 'pie' }),
  XAxis: () => React.createElement('div', { 'data-testid': 'x-axis' }),
  YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
  CartesianGrid: () => React.createElement('div', { 'data-testid': 'cartesian-grid' }),
  Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }),
  Legend: () => React.createElement('div', { 'data-testid': 'legend' }),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronRight: () => React.createElement('span', { 'data-testid': 'chevron-right' }),
  ChevronLeft: () => React.createElement('span', { 'data-testid': 'chevron-left' }),
  User: () => React.createElement('span', { 'data-testid': 'user-icon' }),
  Settings: () => React.createElement('span', { 'data-testid': 'settings-icon' }),
  Home: () => React.createElement('span', { 'data-testid': 'home-icon' }),
  Activity: () => React.createElement('span', { 'data-testid': 'activity-icon' }),
  TrendingUp: () => React.createElement('span', { 'data-testid': 'trending-up-icon' }),
  Heart: () => React.createElement('span', { 'data-testid': 'heart-icon' }),
  Brain: () => React.createElement('span', { 'data-testid': 'brain-icon' }),
  Moon: () => React.createElement('span', { 'data-testid': 'moon-icon' }),
  Sun: () => React.createElement('span', { 'data-testid': 'sun-icon' }),
}));

// Custom test utilities
global.testUtils = {
  // Helper to create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    chronotype: 'early_bird',
    sensitivity_level: 'moderate',
    focus_areas: ['stress', 'energy'],
    created_at: new Date().toISOString(),
    ...overrides,
  }),
  
  // Helper to create mock life score data
  createMockLifeScore: (overrides = {}) => ({
    stress_level: 5,
    energy_level: 7,
    sleep_quality: 6,
    overall_score: 6.0,
    timestamp: new Date().toISOString(),
    ...overrides,
  }),
  
  // Helper to create mock advice data
  createMockAdvice: (overrides = {}) => ({
    id: 'advice-id',
    content: 'Take a 5-minute breathing break',
    category: 'stress',
    priority: 1,
    estimated_duration_minutes: 5,
    created_at: new Date().toISOString(),
    ...overrides,
  }),
};

// Suppress console errors for known issues
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: componentWillMount has been renamed'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
