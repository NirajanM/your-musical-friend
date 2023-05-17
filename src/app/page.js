import Link from 'next/link';

const menuItem = [
  {
    "title": "Youtube Looper",
    "link": "looper",
    "description": "Loop any part of the video with ease by providing start and end time on seconds that you want to be repeated. Can be super helpful while learning specific part of the song or music.",
  },
  {
    "title": "Tuner",
    "link": "tuner",
    "description": "Tune your musical intrument to the perfect pitch online, without having to keep a seperate app installed in your phone taking unnecessary space.",
  }
]

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-around p-8 md:p-24 gap-8">
      {menuItem.map(item => {
        return (
          <Link key={item.title} href={`/${item.link}`} className="flex flex-col justify-around items-center gap-4 border-2 rounded-sm lg:rounded-lg p-4 lg:p-8 hover:bg-slate-50/10 max-w-4xl">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold lg:font-black">{item.title}</h1>
            <p>{item.description}</p>
          </Link>);
      })}
    </main>
  )
}
