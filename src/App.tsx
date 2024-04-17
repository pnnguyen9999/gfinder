import { useState } from "react";
import { SETTINGS } from "./classes/settings";
import useFretBoard from "./hooks/useFretBoard";
import { observer } from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faMusic,
  faRetweet,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const {
    canvasRef,
    chordName,
    selectedKey,
    keyDataTriads,
    markNote,
    handleSelectChange,
    handleSelectTriad,
    playAudio,
  } = useFretBoard();

  const [newTuning, setnewTuning] = useState<string[]>(
    SETTINGS.FRETBOARD.openNotes
  );

  return (
    <div className="flex justify-center py-5">
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl tracking-wide">
          <FontAwesomeIcon icon={faMusic} />
          &nbsp;Guitar fretboard chord analyzer
        </h1>
        <hr />
        <p className="text-sm tracking-wide">Tuner:</p>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <select
              className="bg-[rgba(0,0,0,0.5)] p-2 rounded-md w-[50px] text-center transition ease-in-out hover:translate-y-1 cursor-pointer appearance-none"
              key={n}
              value={newTuning[n]}
              onChange={(e) => {
                const temp = [...newTuning];
                temp[n] = e.target.value;
                setnewTuning(temp);
              }}
            >
              {SETTINGS.FRETBOARD.keys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => SETTINGS.FRETBOARD.changetuning(newTuning)}
            className="font-semibold disabled:bg-slate-500 shadow-lg p-2 rounded-md transition ease-in-out bg-[#9B3922] hover:translate-y-2 hover:bg-[#C6472B] duration-200 border-b-8 border-[rgba(0,0,0,0.2)]"
          >
            <FontAwesomeIcon icon={faRetweet} />
            &nbsp;Change tuning
          </button>
          <button
            onClick={() => {
              SETTINGS.FRETBOARD.resetTunning();
              setnewTuning(SETTINGS.FRETBOARD.openNotes);
            }}
            className="font-semibold disabled:bg-slate-500 shadow-lg p-2 rounded-md transition ease-in-out bg-[#9B3922] hover:translate-y-2 hover:bg-[#C6472B] duration-200 border-b-8 border-[rgba(0,0,0,0.2)]"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            &nbsp;Reset
          </button>
        </div>
        <hr />
        <div>
          <canvas
            ref={canvasRef}
            onClick={markNote}
            width={SETTINGS.FRETBOARD.width}
            height={SETTINGS.FRETBOARD.height}
          ></canvas>
        </div>
        <h1 className="text-4xl">
          {chordName ? `Chord: ${chordName}` : `I don't know :(`}
        </h1>
        <hr />
        <div className="flex items-center gap-2">
          Select key:
          <select
            value={selectedKey}
            onChange={handleSelectChange}
            className="flex gap-2 items-center text-center bg-[rgba(0,0,0,0.2)] p-2 rounded-md w-max appearance-none border border-none"
          >
            {SETTINGS.FRETBOARD.keys.map((key) => (
              <option key={key} value={key}>
                Key {key}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm tracking-wide">Chord list:</p>
        <div className="flex gap-2">
          {keyDataTriads.map((triadCorner) => (
            <button
              className="w-[60px] font-semibold disabled:bg-slate-500 shadow-lg p-2 rounded-md transition ease-in-out bg-[#9B3922] hover:translate-y-2 hover:bg-[#C6472B] duration-200 border-b-8 border-[rgba(0,0,0,0.2)]"
              key={triadCorner}
              value={triadCorner}
              onClick={() => handleSelectTriad(triadCorner)}
            >
              {triadCorner}
            </button>
          ))}
        </div>
        <div>
          {chordName && (
            <button onClick={() => playAudio()}>
              <FontAwesomeIcon icon={faPlay} />
              &nbsp;Play chord
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default observer(App);
