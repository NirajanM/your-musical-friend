"use client"

import { useState, useEffect } from "react";
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
            setPitch(detectedPitch);
            setPitchNote(convertPitchToNoteName(detectedPitch));
            requestAnimationFrame(updatePitch);
        }
    }

    function convertPitchToNoteName(pitch) {
        if (pitch === -1) {
            return "No signal";
        }
        const octave = Math.floor((Math.log2(pitch / 440) + 4) * 12);
        const noteIndex = octave % 12;

        return allNotes[noteIndex];
    }

    useEffect(() => {
        if (analyserNode) {
            requestAnimationFrame(updatePitch);
        }
    }, [analyserNode]);

    return (
        <main className="flex min-h-screen min-w-screen justify-center items-center flex-col gap-8">
            <div className="flex flex-col gap-3">
                {pitch !== null ? (
                    <span className="rounded-full border py-1 px-2">{pitchNote}</span>
                ) : (
                    <span>No signal</span>
                )}
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