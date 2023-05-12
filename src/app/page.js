import Link from 'next/link';

const menuItem = [
  {
    "title": "Youtube Looper",
    "link": "looper",
    "description": "loop any part of the video in a super smooth way by adjusting the slider. Can be super helpful while learning specific part of the song or music",
  }
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
      {menuItem.map(item => {
        return (
          <Link href={`/${item.link}`} className="flex flex-col justify-around items-center gap-4 border-2 rounded-sm lg:rounded-lg p-4 lg:p-8 hover:bg-slate-50/10">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold lg:font-black">{item.title}</h1>
            <p>{item.description}</p>
          </Link>);
      })}
    </main>
  )
}
