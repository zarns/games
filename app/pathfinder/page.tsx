import Image from 'next/image'
import Grid from './Grid';
import Head from 'next/head';

export const metadata = {
  title: 'D* lite Algorithm',
  description: 'Interactive Pathfinding Algorithm Visualizer',
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Pathfinder -asdfasdf Routing Algorithms</title>
        <meta
          name="description"
          content="Interactive visualization of the Pathfinder routing algorithm. Explore how Pathfinder works and understand its routing decisions."
        />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Grid />
      </main>
    </>
  )
}
