import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias["@"] = path.join(__dirname);
    return config;
  },
};

export default nextConfig;