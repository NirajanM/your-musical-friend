"use client"

import { useState, useRef, useEffect } from "react";

export default function page() {

    const [tunerState, setTunerState] = useState(false);

    const handleTuner = () => {
        setTunerState(!tunerState);
    };

    const guitarNotes = [
        "E",
        "A",
        "D",
        "G",
        "B",
        "E"
    ];

    const allNotes = [
        "A",
        "A#",
        "B",
        "C",
        "C#",
        "D",
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#'
    ];

    return (
        <main className="flex min-h-screen min-w-screen justify-center items-center flex-col gap-8">
            <div>
                <div id="guitar-notes" className="flex gap-3">
                    {guitarNotes.map((notation) => {
                        return <span className="rounded-full border py-1 px-2">{notation}</span>
                    })}
                </div>
            </div>
            <button
                onClick={handleTuner}
                className="border rounded-lg py-2 px-4 hover:bg-slate-100/10"
            >
                {tunerState ? "Stop Tuner" : "Start Tuner"}
            </button>
        </main>
    );
}