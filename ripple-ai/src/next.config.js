/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here -  you can keep any other options you had inside */
  webpack: (config) => {
    config.resolve.alias["@"] = require("path").join(__dirname);
    return config;
  },
};

module.exports = nextConfig;
