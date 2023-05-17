"use client"

import { useState, useRef, useEffect } from "react";

export default function page() {

    const [tunerState, setTunerState] = useState(false);

    const handleTuner = () => {
        if (tunerState) {
            setTunerState(false);
            stop();
        }
        else {
            setTunerState(true);
            start();
        }
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

    //audio context controls:

    useEffect(() => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        const buflen = 2048;
        let buf = new Float32Array(buflen);
    }, []);


    const start = async () => {
        const input = await getMicInput();

        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
        }
        setTunerState(true);
        audioCtx.createMediaStreamSource(input);
        console.log(audioCtx);
    };

    const stop = () => {
        audioCtx.close();
        setTunerState(false);
    };

    const getMicInput = () => {
        return navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                autoGainControl: false,
                noiseSuppression: false,
                latency: 0,
            },
        });
    };

    return (
        <main className="flex min-h-screen min-w-screen justify-center items-center flex-col gap-8">
            <div>
                <div id="guitar-notes" className="flex gap-3">
                    {guitarNotes.map((notation, index) => {
                        return <span key={index} className="rounded-full border py-1 px-2">{notation}</span>
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