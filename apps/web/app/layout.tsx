'use client'
import './globals.css'
import '../styles/performance.css'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

// Animation optimization hook (moved from LazyComponents to avoid import issues)
function useAnimationOptimization() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion,
    animationClass: prefersReducedMotion ? '' : 'transition-all duration-300',
  };
}

// Memory optimization hook (moved from LazyComponents)
function useMemoryOptimization() {
  useEffect(() => {
    // Cleanup event listeners on unmount
    return () => {
      // Force garbage collection hint
      if (typeof window !== 'undefined' && window.gc) {
        window.gc();
      }
    };
  }, []);

  // Debounced resize handler
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}

// Performance monitoring
const PerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', entry.toJSON())
          }
          if (entry.entryType === 'paint') {
            console.log('Paint timing:', entry.name, entry.startTime)
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'paint'] })
      
      return () => observer.disconnect()
    }
  }, [])
  
  return null
}

// Loading fallback component
const PageLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-white text-lg">Caricamento...</div>
    </div>
  </div>
)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Performance optimizations
  const { shouldAnimate, animationClass } = useAnimationOptimization()
  const windowSize = useMemoryOptimization()

<<<<<<< HEAD
  // Check if we're on homepage or dashboard to avoid double header
  const isHomepage = pathname === '/' || pathname === '/dashboard'
=======
  // Check if we're on homepage to avoid double header
  const isHomepage = pathname === '/'
>>>>>>> 1ae5f23faa33e9bcc88d73cbb4379817fcb61e1e

  useEffect(() => {
    setMounted(true)
    
    let alive = true
    
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (alive) {
          setUser(data.user)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (alive) {
          setLoading(false)
        }
      }
    }
    
    initializeAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })
    
    return () => { 
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <html lang="it">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="description" content="LifeOS - AI-powered personal wellness platform" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <title>LifeOS</title>
        </head>
        <body className="optimized-text">
          <PageLoading />
        </body>
      </html>
    )
  }

  return (
    <html lang="it">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="description" content="LifeOS - AI-powered personal wellness platform" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        <title>LifeOS</title>
      </head>
      <body className="optimized-text bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        {/* Performance monitoring in development */}
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        
<<<<<<< HEAD
        {/* Header - Only show on non-homepage and non-dashboard routes */}
=======
        {/* Header - Only show on non-homepage routes */}
>>>>>>> 1ae5f23faa33e9bcc88d73cbb4379817fcb61e1e
        {!isHomepage && (
          <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-optimized border-b border-white/10">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link 
                  href="/" 
                  className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover-optimized ${animationClass}`}
                >
                  LifeOS
                </Link>
                
                {/* Navigation - Hidden on small screens, handled by individual pages */}
                <nav className="hidden lg:flex space-x-6 xl:space-x-8">
                  {[
                    { href: '/', label: 'Home' },
                    { href: '/suggestions', label: 'Suggestions' },
                    { href: '/dashboard', label: 'Dashboard' },
<<<<<<< HEAD
                    { href: '/notifications', label: 'Notifications' },
=======
>>>>>>> 1ae5f23faa33e9bcc88d73cbb4379817fcb61e1e
                    { href: '/settings', label: 'Settings' }
                  ].map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className={`text-white/80 hover:text-white transition-colors ${animationClass}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Auth section */}
                <div className="flex items-center gap-4">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : user ? (
                    <div className="flex items-center gap-3">
                      {/* User info - hidden on mobile */}
                      <div className="hidden sm:block text-right">
                        <div className="text-white text-sm font-medium">
                          {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utente'}
                        </div>
                        <div className="text-white/60 text-xs">
                          {user.email}
                        </div>
                      </div>
                      
                      {/* Logout button */}
                      <button 
                        onClick={logout}
                        className={`bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform button-press ${animationClass}`}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/sign-in"
                      className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform button-press ${animationClass}`}
                    >
                      Accedi
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main content with performance optimizations */}
        <main className="contain-layout">
          <Suspense fallback={<PageLoading />}>
            {children}
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                © 2024 LifeOS. Made with 💜 for your wellness journey.
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/support" className="text-white/60 hover:text-white transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Performance hints */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
              
              // Preload critical resources
              const preloadResources = [
                '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
              ];
              
              preloadResources.forEach(url => {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = url;
                document.head.appendChild(link);
              });
            `
          }}
        />
      </body>
    </html>
  )
}
