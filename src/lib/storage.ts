import { HIGH_SCORE_KEY } from "./constants";

export function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? "0", 10);
}

let writeDisabled = false;
/** ミニ版(メドレー)ではベストスコアを書かない */
export function disableStorageWrites() {
  writeDisabled = true;
}

export function saveHighScore(score: number): void {
  if (typeof window === "undefined" || writeDisabled) return;
  localStorage.setItem(HIGH_SCORE_KEY, score.toString());
}
