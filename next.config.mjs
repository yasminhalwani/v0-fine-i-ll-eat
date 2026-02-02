/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Include prompts/*.txt in serverless bundle so AI route can read them on Vercel
  experimental: {
    outputFileTracingIncludes: {
      "/api/generate-meal-plan": ["./prompts/**"],
    },
  },
};

export default nextConfig;