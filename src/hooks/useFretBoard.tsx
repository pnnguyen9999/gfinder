import { useEffect, useState, useRef } from "react";
import { Chord, Key, Interval } from "tonal";
import * as Tone from "tone";
import { SETTINGS } from "../classes/settings";

const synth = new Tone.Synth().toDestination();

interface INote {
  fret: number;
  string: number;
}
function getNoteByStringAndFret(
  string: number,
  fret: number,
  totalFret: number
) {
  const rootString = SETTINGS.FRETBOARD.openNotes[string - 1];
  const rootStringIndex = SETTINGS.FRETBOARD.keys.indexOf(rootString);
  const noteIndex = (rootStringIndex + fret) % totalFret;
  console.log({ rootString, rootStringIndex, noteIndex });
  return SETTINGS.FRETBOARD.keys[noteIndex];
}

function identifyChord(notes: INote[]) {
  notes.sort((a, b) => b.string - a.string);
  const playedNotes = notes.map((note) =>
    getNoteByStringAndFret(note.string, note.fret, SETTINGS.FRETBOARD.frets - 1)
  );
  const chordName = Chord.detect(playedNotes)[0]
    ? Chord.get(Chord.detect(playedNotes)[0]).name
    : "";
  return chordName;
}

function getMinObjectKeyValue(object: { [x: string]: number }) {
  return Object.entries(object).reduce((acc, curr) => {
    if (curr[1] < acc[1]) {
      return curr;
    }
    return acc;
  });
}

const useFretBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [notes, setNotes] = useState<INote[]>([]);
  const [chordName, setChordName] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [keyDataTriads, setKeyDataTriads] = useState<readonly string[]>([]);
  const [currentTriadNotes, setCurrentTriadNotes] = useState<string[]>([]);

  const markNote = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const fretSpacing = SETTINGS.FRETBOARD.width / SETTINGS.FRETBOARD.frets;
      const fret = Math.floor(x / fretSpacing);
      const stringSpacing =
        SETTINGS.FRETBOARD.height / SETTINGS.FRETBOARD.strings;
      const string = Math.ceil(y / stringSpacing);

      console.log({ x, y });
      const existingNoteIndex = notes.findIndex(
        (note) => note.string === string && note.fret === fret
      );
      const existingNoteString = notes.findIndex(
        (note) => note.string === string
      );
      if (existingNoteIndex >= 0) {
        const updatedNotes = [...notes];
        updatedNotes.splice(existingNoteIndex, 1);
        setNotes(updatedNotes);
      } else {
        if (existingNoteString >= 0) {
          const updatedNotes = [...notes];
          updatedNotes.splice(existingNoteString, 1);
          setNotes(updatedNotes);
          setNotes((prevNotes) => [...prevNotes, { fret, string }]);
        } else {
          setNotes((prevNotes) => [...prevNotes, { fret, string }]);
        }
      }
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKey(event.target.value);
  };

  const handleSelectTriad = (triadCorner: string) => {
    let notes = Chord.get(triadCorner).notes;
    setCurrentTriadNotes(notes);
    console.log({ notes });
    drawChord(notes);
  };

  const drawChord = (triadNotes: string[]) => {
    setNotes([]);
    const rootNoteBassFrets = {
      6: Interval.get(
        Interval.distance(SETTINGS.FRETBOARD.openNotes[6 - 1], triadNotes[0])
      ).chroma,
      5: Interval.get(
        Interval.distance(SETTINGS.FRETBOARD.openNotes[5 - 1], triadNotes[0])
      ).chroma,
      4: Interval.get(
        Interval.distance(SETTINGS.FRETBOARD.openNotes[4 - 1], triadNotes[0])
      ).chroma,
    };
    const minBassEntry = getMinObjectKeyValue(rootNoteBassFrets);

    console.log({ minBassEntry });

    for (let i = parseInt(minBassEntry[0]); i > 0; i--) {
      const triadNoteDistance = {
        [triadNotes[0]]: Interval.get(
          Interval.distance(SETTINGS.FRETBOARD.openNotes[i - 1], triadNotes[0])
        ).chroma,
        [triadNotes[1]]: Interval.get(
          Interval.distance(SETTINGS.FRETBOARD.openNotes[i - 1], triadNotes[1])
        ).chroma,
        [triadNotes[2]]: Interval.get(
          Interval.distance(SETTINGS.FRETBOARD.openNotes[i - 1], triadNotes[2])
        ).chroma,
      };
      const minDistanceEntry = getMinObjectKeyValue(triadNoteDistance);
      setNotes((prevNotes) => [
        ...prevNotes,
        { fret: minDistanceEntry[1], string: i },
      ]);
      console.log(minDistanceEntry);
    }
  };

  const drawFretboard = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, SETTINGS.FRETBOARD.width, SETTINGS.FRETBOARD.height);
    let stringSpacing =
      SETTINGS.FRETBOARD.height / (SETTINGS.FRETBOARD.strings + 1);
    let fretSpacing = SETTINGS.FRETBOARD.width / SETTINGS.FRETBOARD.frets;

    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    // Draw strings
    ctx.font = "15px monospace";
    ctx.fillStyle = "#fff";
    for (let i = 1; i <= SETTINGS.FRETBOARD.strings; i++) {
      ctx.beginPath();
      ctx.moveTo(25, i * stringSpacing);
      ctx.lineTo(SETTINGS.FRETBOARD.width, i * stringSpacing);
      ctx.fillText(
        SETTINGS.FRETBOARD.openNotes[i - 1],
        0,
        i * stringSpacing + 7
      );
      ctx.strokeStyle = "#D9E8E2";
      ctx.stroke();
    }

    // Draw frets
    for (let j = 1; j <= SETTINGS.FRETBOARD.frets; j++) {
      ctx.beginPath();
      ctx.moveTo(j * fretSpacing, 0);
      ctx.lineTo(j * fretSpacing, SETTINGS.FRETBOARD.height);
      ctx.fillText(
        (j - 1).toString(),
        j * fretSpacing - fretSpacing * 0.5,
        SETTINGS.FRETBOARD.height - 2
      );
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }

    notes.forEach((note) => {
      let noteX = (note.fret + 1) * fretSpacing - fretSpacing / 2;
      // let noteY = note.string * stringSpacing + stringSpacing / 5;
      ctx.beginPath();
      if (note.fret === 0) {
        ctx.strokeStyle = "#1F513B";
      } else {
        ctx.strokeStyle = "#ffffff";
      }
      ctx.lineWidth = 5;
      ctx.moveTo(noteX, note.string * stringSpacing - 8);
      ctx.lineTo(noteX, note.string * stringSpacing + 8);
      ctx.stroke();
    });
  };

  function playAudio() {
    const notesWithPitch = notes.map(
      (note, i) =>
        `${getNoteByStringAndFret(
          note.string,
          note.fret,
          SETTINGS.FRETBOARD.frets - 1
        )}${SETTINGS.FRETBOARD.strings - note.string}`
    );
    console.log(notesWithPitch);

    notesWithPitch.forEach((note, index) => {
      setTimeout(() => {
        synth.triggerAttackRelease(note, "8n");
      }, index * 110);
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;
    setChordName(identifyChord(notes));
    drawFretboard(ctx);
  }, [canvasRef, SETTINGS.FRETBOARD.openNotes, notes]);

  useEffect(() => {
    if (selectedKey !== "") {
      setKeyDataTriads(Key.majorKey(selectedKey).triads);
    }
  }, [selectedKey]);

  useEffect(() => {
    playAudio();
  }, [notes]);

  useEffect(() => {
    if (currentTriadNotes.length !== 0) {
      drawChord(currentTriadNotes);
    }
  }, [SETTINGS.FRETBOARD.openNotes]);

  return {
    canvasRef,
    notes,
    chordName,
    selectedKey,
    keyDataTriads,
    markNote,
    handleSelectChange,
    handleSelectTriad,
    playAudio,
  };
};

export default useFretBoard;
