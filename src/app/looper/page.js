"use client";

import { useState } from "react";

export default function page() {

    const handleClick = (event) => {
        event.preventDefault();
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
            <form className="flex flex-col w-full max-w-7xl mx-auto items-center justify-center">
                <div className="w-full flex flex-col md:flex-row justify-center gap-4 ">
                    <input className="bg-transparent border rounded-lg px-4 py-2 w-full max-w-xl" placeholder="Enter video link..."></input>
                    <button onClick={handleClick} className="inline px-4 py-2 rounded-lg border-2 hover:bg-slate-50/10">Search</button>
                </div>
            </form>
        </main>
    )
}
