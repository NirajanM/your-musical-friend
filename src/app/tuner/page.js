"use client"

import { useState, useEffect } from "react";
import autoCorrelate from "./pitchDetection";
import { allNotes, guitarNotes, notes } from "./notestype";

export default function page() {

    const [tunerState, setTunerState] = useState(false);
    const [pitch, setPitch] = useState(null);
    const [currentGuitarNote, setCurrentGuitarNote] = useState(null);
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

    //audio context controls:
    const [source, setSource] = useState(null);
    const [pitchNote, setPitchNote] = useState(null);
    const [audioCtx, setAudioCtx] = useState(null);
    const [analyserNode, setAnalyserNode] = useState(null);

    useEffect(() => {
        const initializeAudio = async () => {
            try {
                console.log("Initializing audio...");
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 2048;

                setAudioCtx(ctx);
                setAnalyserNode(analyser);
                console.log("Audio initialized");

            } catch (error) {
                console.error("Failed to initialize audio: ", error);
            }
        };

        initializeAudio();
    }, []);


    const start = async () => {
        try {
            const mic = await getMicInput();
            if (audioCtx.state === "suspended") {
                await audioCtx.resume();
            }
            setTunerState(true);
            setSource(audioCtx.createMediaStreamSource(mic));
            console.log("Tuner started!");
        } catch (error) {
            console.error("Failed to start tuner: ", error);
        }
    };

    useEffect(() => {
        if (source != null && analyserNode != null) {
            source.connect(analyserNode);
        }
    }, [source, analyserNode]);

    const stop = () => {
        if (source && analyserNode) {
            source.disconnect(analyserNode);
            setTunerState(false);
        }
    };

    const getMicInput = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    autoGainControl: false,
                    noiseSuppression: false,
                    latency: 0,
                },
            });
            return mediaStream;
        } catch (error) {
            console.error("Failed to get microphone input: ", error);
        }
    };

    //update pitch :

    function updatePitch() {
        if (analyserNode && audioCtx) {
            const bufferLength = analyserNode.fftSize;
            const dataArray = new Float32Array(bufferLength);
            analyserNode.getFloatTimeDomainData(dataArray);
            const pitchDetectionResult = autoCorrelate(dataArray, audioCtx.sampleRate);
            const detectedPitch = pitchDetectionResult;
            const closestNote = getClosestGuitarNote(detectedPitch);
            setPitch(detectedPitch);
            setPitchNote(convertPitchToNoteName(detectedPitch));
            setCurrentGuitarNote(closestNote);
            requestAnimationFrame(updatePitch);
        }
    }

    function convertPitchToNoteName(pitch) {
        if (pitch === -1) {
            return "";
        }
        const octave = Math.floor((Math.log2(pitch / 440) + 4) * 12);
        const noteIndex = octave % 12;
        return allNotes[noteIndex];
    }

    function getClosestGuitarNote(pitch) {
        let closestNote = null;
        let closestDiff = Infinity;

        for (let note of guitarNotes) {
            const noteFrequency = notes.find(n => n.name === note)?.frequency;

            if (noteFrequency) {
                const diff = Math.abs(pitch - noteFrequency);

                if (diff < closestDiff) {
                    closestNote = note;
                    closestDiff = diff;
                }
            }
        }

        return closestNote;
    }

    useEffect(() => {
        if (analyserNode && tunerState) {
            requestAnimationFrame(updatePitch);
        }
    }, [analyserNode, tunerState]);

    return (
        <main className=" flex flex-col min-h-screen min-w-screen justify-center items-center p-4">
            <div className=" flex justify-start items-start flex-col gap-8">
                <div className="flex gap-5 items-start justify-start">
                    <div className="grid grid-cols-1 gap-4">
                        <span>
                            <img width={35} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEoklEQVR4nNWZW4hWVRTHtzZaUWZBF2a8VBAF9WC+lBGElZWpBJZUdKGiYgijUdCRLhKMUb1EQVA9JBV0F3rIZEy0UoKiIKei29gFupFY2mRW2uUny/kfWB3P+c7lO2fmzB+Gmfn22muv/7fWXnvttUNoOIAPgI+AOcBbwG5gCzAzjCUAH5KMPcDsMIY8sdgZvwaYAjyl/38HzgtjzBNrgLOAF4DxwGp9bqF2ZmgqgMsTSPwC9Gh8vPPMltBEAF3ArgQSSzTeAzwvOcOvoYkAVsrAVxNILNH/Z4ukYVNoGoDJwFYZeDOw1oWTkdgJzHIkDHNCA0m8K+O+AU5yYz0Kt3NiJAwDocEkToyNvwacGyNhqXnA5oUGkvg6gcQ04CaF2ch5AjgNuFKLXwRMzUniK2B6bHwqsM0Zv0upuT5PAAu0QBz/AW8D11r+L0liALgb6KzFeC04DnjYGf4z0A88DWwE/nBjVnrMiJH40sInpJMwucm1EXCL3qkF/wR6gSNj40cBtwM/Se4v4POmkThOleg/th8yZM0LLzrvbIvvH0aDhBa+T4u+nEM2Hk7Tm0JigguXWQVINMcTBuBGLfxJaI/EtNHyRAcwD9ihxW9pg0QnMKjxT2slAUwC5gN9wOtWNrsNu9afDSVIfOZ07bHDtGrjDwWu0TnwNwfje6XdjpIkulwKNrmX9Pd7wCFVkViorILL+9bBeBC4Gjg9zQsFSHzh9wRwDPCDPruhCi884wgMqF46Iuf8S4ENwJDT0R2TmRIn4cbu0Odb2yFxtPpF0YW+u4iLtX/SsMqRGEzLTgzvxehLOLkMiYnAZin41mqhEsViFILLtIntZ7k+O+CZPCkWWCeZRWWI9Llir/A3Abyp+csSxqz28mh5TgBPZKX0tIldKvb+BS4sSkI6LBRJKrFdpyOThEF9K8N1oQiAuzRxXaGJ/9fxWw4iQzlITHCZq9h54jb4ZSU4RDo2ScfyhLEVGuvPoadbsh/bHaeoEdZewXcsikKnfrTZe+WFLpHYq7GLM3RYYyEK0YVljLB7hOGwDDnrWDybJmcplnTc20LvDLU+90n2ycIkpGgoyyPA9c6o/hZk5ivMduvHypu5KUXnbeq2R7Ay6P7S5QnwvhRd0kJmtjJbJpkc63Wo8Ixg7c9HgVNLEXCKH5DCxzPk5lZBRp0QdCGzonRiWwQi2NuCFO/IsU/aIqOngB+zIqA0XNN4RQ7Z0mSAMzRnZ2WlekLVGnXxjg01kVEoGdaHusBwhoneJMaVIPNcjjl2nzH0VWZ4HFYsuleipSEHYmQW55CPKux5oU4AV7icnqtkUWrOLPB019irg29SJQa3gg4l9E1fECoCcKv0bqhKZ56G9GPuHbvtMLAM5U7xq9rVFwrm++juvq/w3eBgfdGj/2BlB2BBMo+4943ewqX1sJ6Z8qxhQRgtMHzxMiKoIMxd7pss8J3mrq7X0hzQS1N0C7TfS4HDM+acD2zXnM0jHlJpAE4B3nAH4Ha9Utkb4fGqajvV3HvFya23VlNoGoBFKe+Ecdh95J5aaqpQEZSi7eH+IeAdVc52iFrjwFpD1ts6YSSN2g89rDPwlLNbLAAAAABJRU5ErkJggg=="></img></span>
                        {guitarNotes.map((notation, index) => {
                            return <span key={index} className={(currentGuitarNote === notation) ? "bg-slate-50/50 rounded-full border py-1 px-2 w-7" : "rounded-full border py-1 px-2 w-7"}>{notation.charAt(0)}</span>
                        })}
                    </div>

                    <div className="flex-1 flex justify-center items-center flex-col gap-2">
                        <span className="text-3xl font-black">{tunerState ? "Accurate Note:" : null}</span>
                        <span className="text-5xl font-black">{tunerState ? pitchNote : null}</span>
                        <span className="text-lg font-black">{tunerState ? "Closest Guitar Note:" : null}</span>
                        <span className="text-3xl font-black">{tunerState ? currentGuitarNote : null}</span>
                        <span className="text-xl font-black">{tunerState ? pitch : null}</span>
                    </div>
                </div>
                <div className="flex justify-center items-center flex-col gap-8">

                    <div className="flex flex-col gap-3 items-center justify-center">
                        <div id="guitar-notes" className="grid gap-3 border-t py-4 grid-cols-6 items-center text-center even:absolute">
                            {allNotes.map((notation, index) => {
                                return <span key={index} className={(pitchNote === notation) ? "bg-slate-50/50 rounded-full border py-1 px-2" : "rounded-full border py-1 px-2"}>{notation}</span>
                            })}
                        </div>
                    </div>
                    <button
                        onClick={handleTuner}
                        className="border rounded-lg py-2 px-4 hover:bg-slate-100/10"
                    >
                        {tunerState ? "Stop Tuner" : "Start Tuner"}
                    </button>
                </div>
            </div>
        </main>
    );
}