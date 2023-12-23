/** @type {import('next').NextConfig} */
const nextConfig = {
  routes() {
    return [
      {
        source: '/bandit',
        destination: 'bandit/Bandit',
      },
      {
        source: '/battleships',
        destination: 'battleships/Battleships',
      },
      {
        source: '/pathfinder',
        destination: 'pathfinder/Pathfinder',
      },
    ];
  },
};

module.exports = nextConfig;
