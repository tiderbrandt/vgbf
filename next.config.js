/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // Cloudinary domains
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cloudinary.com',
                port: '',
                pathname: '/**',
            },
            // Legacy Vercel Blob domains (for existing images)
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'vercel-storage.com',
                port: '',
                pathname: '/**',
            }
        ],
    },
    // Force dynamic rendering for pages that require database access
    experimental: {
        serverComponentsExternalPackages: []
    },
    // Add headers for better HTTPS handling in production
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig
