"use client";

import { useState } from "react";
import React from 'react'
import ReactPlayer from 'react-player'


export default function page() {

    const [url, setUrl] = useState("");

    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        setVisible(true);
    }

    const handleChange = (event) => {
        setUrl(event.target.value);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-center gap-4 ">
                <input className="bg-transparent border rounded-lg px-4 py-2 w-full max-w-xl" placeholder="Enter video link..." onChange={handleChange}></input>
                <button onClick={handleClick} className="inline px-4 py-2 rounded-lg border-2 hover:bg-slate-50/10">Search</button>
            </div>
            {
                visible && <ReactPlayer url={url} />
            }

        </main>
    )
}
