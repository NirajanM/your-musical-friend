import Image from 'next/image';
import Link from 'next/link';

const menuItem = [
  {
    "title": "Youtube Looper",
    "link": "looper",
    "icon": "/youtubelooper.png",
    "description": "You can easily loop any part of the video by providing the start and end times in seconds that you want to be repeated. This feature can be incredibly helpful when learning a specific part of a song or music..",
  },
  {
    "title": "Tuner",
    "link": "tuner",
    "icon": "/tuner.png",
    "description": "Experience the convenience of tuning your musical instrument to perfect pitch without the hassle of installing a separate app on your phone. Say goodbye to unnecessary storage consumption and welcome the simplicity of tuning directly from our website!",
  }
]

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-around p-8 md:p-24 gap-8">
      {menuItem.map(item => {
        return (
          <Link key={item.title} href={`/${item.link}`} className="flex flex-col justify-around items-center gap-4 border-2 rounded-sm lg:rounded-lg p-4 lg:p-8 hover:bg-slate-50/10 max-w-4xl">
            <Image src={item.icon} width={50} height={50} alt={item.title} />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold lg:font-black">{item.title}</h1>
            <p>{item.description}</p>
          </Link>);
      })}
    </main>
  )
}
