/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/bandit/Bandit',
        destination: '/bandit/',
      },
      {
        source: '/battleships',
        destination: '/battleships/',
      },
      {
        source: '/pathfinder',
        destination: '/pathfinder/',
      },
    ];
  },
};

module.exports = nextConfig;
