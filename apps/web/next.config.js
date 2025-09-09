const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Disable static optimization during analysis
  ...(process.env.ANALYZE === 'true' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    ...(process.env.ANALYZE === 'true' && { unoptimized: true }),
  },

  // Experimental features per performance (FIXED)
  experimental: {
    scrollRestoration: true,
  },

  // Compression e headers
  compress: true,
  poweredByHeader: false,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer 
            ? '../analyze/server.html' 
            : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }

    // Exclude Storybook files from build
    config.module.rules.push({
      test: /\.stories\.(js|jsx|ts|tsx|mdx)$/,
      use: 'ignore-loader',
    });

    // Production optimizations
    if (!dev && !isServer) {
      // Remove unused CSS
      config.optimization.usedExports = true;
      
      // Minimize bundle size
      config.resolve.alias = {
        ...config.resolve.alias,
        'react': 'react',
        'react-dom': 'react-dom',
      };
    }

    // LifeOS packages optimization
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lifeos/packages': path.resolve(__dirname, '../../packages'),
      '@lifeos/types': path.resolve(__dirname, '../../packages/types'),
    };

    // Tree shaking per LifeOS packages
    config.optimization = {
      ...config.optimization,
      sideEffects: false,
    };

    return config;
  },

  // Output optimization
  output: 'standalone',
  
  // Static optimization
  trailingSlash: false,
  
  // Redirects per SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites per dynamic routes - FIXED to handle undefined env variable
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Only add rewrites if Supabase URL is defined
    if (!supabaseUrl) {
      console.warn('NEXT_PUBLIC_SUPABASE_URL not defined - skipping API rewrites');
      return [];
    }
    
    return [
      {
        source: '/api/v1/:path*',
        destination: `${supabaseUrl}/functions/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;