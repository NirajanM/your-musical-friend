"use client";

import { useState } from "react";
import React from 'react'
import ReactPlayer from 'react-player/youtube'


export default function page() {

    const [url, setUrl] = useState("");

    const [slider, setSlider] = useState(1);

    const [seekTime, setSeekTime] = useState(null);

    const [endTime, setEndTime] = useState(null);

    const [visible, setVisible] = useState(false);

    const [play, setPlay] = useState(false);

    const handleLoopPlay = () => {
        if (play) {
            setPlay(!play);
        }
        else {
            const newUrl = url + '&start=' + seekTime + '&end=' + endTime;
            setUrl(newUrl);
            setPlay(!play);
        }
    }
    const restartloop = () => {
        const newUrl = url + '&start=' + seekTime + '&end=' + endTime;
        setUrl(newUrl);
        setPlay(!play);
    }

    const handleClick = () => {
        setVisible(true);
    }

    const handleChange = (event) => {
        setUrl(event.target.value);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24 gap-8 ">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-center gap-4 ">
                <input className="bg-transparent border rounded-lg px-4 py-2 w-full max-w-xl" placeholder="Enter video link..." onChange={handleChange}></input>
                <button onClick={handleClick} className="inline px-4 py-2 rounded-lg border-2 hover:bg-slate-50/10">Search</button>
            </div>
            {
                visible &&
                <>
                    <ReactPlayer url={url} controls={true} playing={play} volume={slider} onEnded={restartloop} className="max-w-2xl" width="100%" />

                    <div className="w-full max-w-2xl mx-auto flex flex-start gap-4">Volume:<input type="range" min={0} max={1} value={slider} step={0.01} onChange={(e) => { setSlider(e.target.value) }} className="w-full max-w-xl" /></div>

                    <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
                        <div className="flex flex-start flex-col gap-4 items-center w-full"><span>Start time:</span><input type="number" value={seekTime} onChange={(e) => { setSeekTime(e.target.value) }} placeholder="in seconds" className="px-4 py-2 border rounded-lg bg-transparent w-full" />
                        </div>
                        <div className="flex flex-start flex-col gap-4 items-center w-full"><span>End time:</span><input type="number" value={endTime} placeholder="in seconds" onChange={(e) => { setEndTime(e.target.value) }} className="px-4 py-2 border rounded-lg bg-transparent w-full" /></div>

                    </div>

                    <div>
                        <span onClick={handleLoopPlay} className="flex gap-1 items-center">
                            {play ? <img width={50} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAACXBIWXMAAAsTAAALEwEAmpwYAAABCUlEQVR4nO3aQQrCUBAD0DmIrj17RfBiKuoFIh+605KmMhghb1kkZGZc/qqIiIj4KwD2AE4Anng3vp0BHFzzt5S5gruN37rly+bNr3V0y5ct/M2WPNzyZRC55csyMOG20HIrlIEJ/WSi7kLd+bIMTLgttNwKZWBCP5mou1B3viwDE24LLbdCGZjQTybqLtSdL8vAhNtCy61QBib0k4m6C3XnyzIw4bbQciuUgQn9ZKLuQt35sgxMuC203AplYEI/mai7UHe+LAMTbgstt0IZmNBPJuou1J1fzY9O7m75svlR2FqTW75svICbH4UxFwA7t/xN5tdyx/FO6kOR8W36pkx3fkRERNRPvADo9Tv1fUghcwAAAABJRU5ErkJggg==" /> : <img width={50}
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABpUlEQVR4nO3ZsWoVQRTG8VFRIRIwoGCaNDbXRi1MZ2cl4hMIeYVU6W18AEvLpLS1kjQmTUhjZ3G1sUgKBQtFiBjNTxZncXLVKrsrZ9x/cxnuvWf2Y3bmfHNOSiMjIyMlWMO5FB0/meJuqkBIyyaupYj4xaf8+QWPcCEFFbKIJ/iex/tYwakUAZlifAs7hcAt3EjRhDTgdF6Nd/nrZpU2cDlFEtKCi3iMw/yzD1jFmRRJSAsmeF68bi9xO0UT0oL7eFsIeoalFE1IA+bwEAf5r5/z+HyKJKQFV/G0WJ03uJeiCWnBHbz65+7ACYXkGGfzafYxh/uaT7v57p50ACFFrMWcb44Gdwc6FFLEXMbujDu43uUcgwiZcQfvZ9zBpa7n6lVIEX8h75dvvbqDvoUU89zEdm/uYCghDc2mxwPs5WmbQ2EdV9JJGYX8b6+W6JtdDcev3xPii1AJMbxFUYNp9GcbP+n2KYe9WL0OdbFSw1XX8eLDUV6ROMUH0ctBohfo/L1k2k9WHrCI3W9W7oLq2goqavRU0Xqb1tAMXauiPT0yMpJC8wMwt28IhNUf6QAAAABJRU5ErkJggg==" />}
                            {
                                play ? "End Loop" : "Start Loop"
                            }

                        </span>
                    </div>

                </>
            }

        </main>
    )
}
