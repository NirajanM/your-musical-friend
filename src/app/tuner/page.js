"use client"

import { useState, useRef, useEffect } from "react";
import autoCorrelate from "./pitchDetection";

export default function page() {

    const [tunerState, setTunerState] = useState(false);
    const [pitch, setPitch] = useState(null);

    //toogling tuner
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
    const [source, setSource] = useState(null);
    const [audioCtx, setAudioCtx] = useState(null);
    const [analyserNode, setAnalyserNode] = useState(null);

    useEffect(() => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        setAudioCtx(ctx);
        setAnalyserNode(analyser);
    }, []);

    const start = async () => {
        const mic = await getMicInput();
        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
        }
        setTunerState(true);
        setSource(audioCtx.createMediaStreamSource(mic));
    };

    useEffect(() => {
        if (source != null && analyserNode != null) {
            source.connect(analyserNode);
        }
    }, [source, analyserNode]);

    const stop = () => {
        source.disconnect(analyserNode);
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

    //update pitch :

    function updatePitch() {
        const bufferLength = analyserNode.fftSize;
        const dataArray = new Float32Array(bufferLength);
        analyserNode.getFloatTimeDomainData(dataArray);

        const pitchDetectionResult = autoCorrelate(dataArray, audioCtx.sampleRate);
        const detectedPitch = pitchDetectionResult.pitch;

        setPitch(detectedPitch);

        requestAnimationFrame(updatePitch);
    }

    useEffect(() => {
        if (analyserNode) {
            requestAnimationFrame(updatePitch);
        }
        console.log(pitch);
    }, [analyserNode]);

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