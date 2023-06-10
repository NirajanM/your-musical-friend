"use client"

import { useState, useEffect } from "react";
import autoCorrelate from "./pitchDetection";
import { allNotes, guitarNotes, notes, allNotesWithFreq } from "./notestype";
import Image from "next/image";
export default function page() {

    const [tunerState, setTunerState] = useState(false);
    const [pitch, setPitch] = useState(null);
    const [currentGuitarNote, setCurrentGuitarNote] = useState(null);
    const [showChart, setShowChart] = useState(false);
    const [indicator, setIndicator] = useState(null);
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
        return () => {
            if (audioCtx) {
                audioCtx.close();
            }
        };
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
        }
        setTunerState(false);
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
            const detectedPitch = autoCorrelate(dataArray, audioCtx.sampleRate);
            setPitch(detectedPitch);
            setPitchNote(convertPitchToNoteName(detectedPitch));
            const closestNote = getClosestGuitarNote(detectedPitch);
            setCurrentGuitarNote(closestNote);
            requestAnimationFrame(updatePitch);
        }
    }

    function convertPitchToNoteName(pitch) {
        if (pitch === -1) {
            return null;
        }

        const octave = Math.floor((Math.log2(pitch / 440) + 4) * 12);
        const noteIndex = octave % 12;

        //destructuring clostest note found!
        const { note, frequency } = allNotes[noteIndex] || {};

        // Calculating the expected frequency based on the detected note
        const expectedFrequency = frequency * Math.pow(2, ((octave - 4) + noteIndex) / 12);

        // Calculating the offset
        const offset = pitch - expectedFrequency;
        console.log("expectedFrequency: " + expectedFrequency, "pitch: " + pitch,)

        // Define thresholds for classification
        const tolerance = 0.5; // Adjust this value based on your preference

        if (offset > tolerance) {
            setIndicator("Too High")
        } else if (offset < -tolerance) {
            setIndicator("Too Low")
        } else {
            setIndicator("Good")
        }
        return note;
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
                        <span className="text-lg font-black">{tunerState ? "Closest Guitar Note:" : null}</span>
                        <span className="text-3xl font-black">{tunerState ? currentGuitarNote : null}</span>
                        <span className="text-3xl font-black">{tunerState ? "Accurate Note:" : null}</span>
                        <span className="text-5xl font-black">{tunerState ? pitchNote : null}</span>
                        <span className={indicator === "Good" ? "text-yellow" : "text-red"}>{tunerState && indicator}</span>
                    </div>
                </div>
                <div className="flex justify-center items-center flex-col gap-8">

                    <div className="flex flex-col gap-3 items-center justify-center">
                        <div id="guitar-notes" className="grid gap-3 border-t py-4 grid-cols-6 items-center text-center even:absolute">
                            {allNotes.map((notation, index) => {
                                return <span key={index} className={(pitchNote === notation.note) ? "bg-slate-50/50 rounded-full border py-1 px-2" : "rounded-full border py-1 px-2"}>{notation.note}</span>
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
            {tunerState &&
                <div className="mt-8 flex flex-col items-center justify-center group gap-1">
                    <div onClick={() => { setShowChart(!showChart) }} className="flex flex-col items-center justify-center">
                        <span
                            className="cursor-pointer group-hover:text-green-200/90 text-lg"
                        >
                            {!showChart ? "Show Pitch & Chart" : "Hide Pitch & Chart"}
                        </span>
                        {!showChart ?
                            <Image
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC4ElEQVR4nO2cvW7bMBRGtbR9ggrNqwVd6qcrWifp4G5du1RbNfRxTiHAigVbP5RDUvdS31liGKF9mWOK4s0HV5UQQgghhBBCCCGEEEIIcQPwG2iAutQ/D1ADf4BflXW48A94qAoD+Aj87SdZORJSnBSuZHgT0g5+1oVcptqrubkSMvw0uV4p3M7lkzsh58fupTAi4/y8PyHepTAhw7UQr1KYkeFeiDcpLMgoQogXKQTIKEaIdSkEyihKiFUprJBRnBBrUlgpw6WQkNP5yOm3zlPl22o4j3EjpJmaHPAFeGdFCgvv3dUKHGbGNJV15iYJPAEvFqQQJqOr9WnLOqMwtT+cJ/kM/AQ+hIzZ6NDXy3it8559xhRWpbBHGValsGcZ1qQgGXakIBl2pCAZdqQgGXakIBl2pCAZdqQgGXakIBl2pCAZ8bK9U007LifnkIZkSKPwB/B+7j1X1Ft2tjfCSsnSDvGe7W0zrZRmbFUmWhmvMVJvQtpcUsZILGNf2V7uuHxlvEztM9vLnVJyyLiep2muC80phUwyxuZplrFCc0gho4ypeZpkqtDIG2o9stGn3MBvxroXkljKd+CYS8bSPE2xVGiKy9eQlJepIoWklEImGcUJSSGFjDJcCkmd7WVFczF2DSVlew/9xjt4LmZvqY0po6u1yyOXnO09Dm9NQ8YsMddcjCCjq/UYOsYsW+ewlljxz6xTMQlGq1LYowyrUtizDGtSkAw7UpAMl9neU7GXKYfZ3tPuZBjO9p52KyOwlf4V+Bw6Zs3rjxz6nvvAhNtDXywifeofAn5HK2MrKUiGHSlIRjze0AJvB2O0Z8QkYCM+LHSJtYEbat03E9le3U2lksLlnHIjZea1vunW1pAU4FHnjA0Pj1Ps/tAXCzI0F0WGu68erYxCghMi8p6CZOSBxNleEVkKkrENRM72ijhS6hjZXhERAr44QGSGO7O9QgghhBBCCCGEEEIIIUSVjP9I6pMyml3z0QAAAABJRU5ErkJggg=="
                                className="text-green-200 group-hover:scale-125"
                                width={40}
                                height={40}
                            /> :
                            <Image
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAACwklEQVR4nO2czU7cMBRGvZn2CRrBq8GOt4NW0EW7KksWleiqs+BxviooFlE0rvNn+zo+RxpplOQGT07sGztXOAcAAAAAAAAAAAAAUBxJnaQXSa/999LtaRpJXyT91Qdvkq5Lt6vlnnEeRJwn3+kpBXvGm6SrC9voKaVkuPA+pJSS4UFKuZzRDds/Sfom6S52LCSW0SPpQdKjpJMbgZREKHK3S7qZykBKwZwRg5xSIGfEYPhKK+P7pZwROM9dH4MUAzJ6hp7UxyAl89PUn0uLi/2xQwxS9pQRepqaxITikLKUNUlXCxYXkZL40VYrFhdHUn5K+hw4T9trX3vJcOF9SCklw4OUTJM+LcgzMx4QSPSxu3y4SE+SfvgxPhYTkc7wZUWGBymGZHiQYkiGBymGZHiQYkiGp2kp1mQ0LcWqjCal5C5I0Mra3gWTx4c92lmM4d3E2iX084aLujU+JOXmPzGvzjqji7NmCb3LXdu7Yen/HWeduQ3deQZ+tWWMXxN7KCF7y3DhfcmkHEZIKhm5pRxCyM45oxsl3q/D55Tq7yz5naYINTShjKfJJ4uUqoWkGKY0mWTuPZmbMXmsU0gOGe7j+GxSqhSSU0ZuKdUJKSEjp5QahaRM4KcZ5zklTvTVCckiQ/Ha3lRSqhOSfJjSjH8ckHj4qkLIs6TfmXrGeRQTW7Xdu6f0v/GXOxp7vcxSSy+danmzKKTYkeFBisF37qKn2JHhQcoMqO01BLW9hihdpyVyih0ZHqQYkuFpWoo1GU1LsSqjSSmR2t77mQuFXcl2Tm6e+5LtTF3be2tBxkIpt5Nt1PamhNreAjkjBrW9hmR4qO01JKPl2l5zPWOtlOqF1CBjiZSqhdQkw0Ntr0FEba89qO01SNO1vVY5Sm1vFQl8LhdKV6sScigZTdX21oaOXNsLAAAAAAAAAAAAAG47/wCPmJLR6XEwvgAAAABJRU5ErkJggg=="
                                className="text-green-200 group-hover:scale-125"
                                width={40}
                                height={40}
                            />
                        }
                    </div>
                    {showChart &&
                        <>
                            <span className="text-xl font-black my-5">{pitch} Hz</span>
                            <Image
                                src="/notes.jpg"
                                width={800}
                                height={1650}
                            />
                        </>
                    }
                </div>
            }
        </main>
    );
}