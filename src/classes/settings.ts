import { makeAutoObservable } from "mobx";
import { CONFIG } from "../constants/config";

class FretboardSettings {
  width = CONFIG.FRET.width;
  height = CONFIG.FRET.height;
  strings = CONFIG.FRET.strings;
  frets = CONFIG.FRET.frets;
  openNotes = CONFIG.FRET.openNotes;
  keys = CONFIG.FRET.keys;

  constructor() {
    makeAutoObservable(this);
  }

  changetuning(newTuning: string[]) {
    this.openNotes = newTuning;
  }

  resetTunning() {
    this.openNotes = CONFIG.FRET.openNotes;
  }
}

export class Settings {
  static instance: Settings | null = null;

  public FRETBOARD = new FretboardSettings();

  constructor() {
    makeAutoObservable(this);
  }

  static getInstance() {
    if (!Settings.instance) {
      Settings.instance = new Settings();
    }
    return Settings.instance;
  }
}

export const SETTINGS = Settings.getInstance();
