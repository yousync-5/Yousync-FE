import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.youtube.com', 'phinf.pstatic.net', 'encrypted-tbn0.gstatic.com'],
  },
}

export default nextConfig
