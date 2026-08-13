import { BirdIcon } from "./bird_icon";
import styles from './game_hints.module.css';

export type GameHintsProps = {
    hints: string[];
    hintTitles: string[];
    birdName: string;
    totalGuesses: number;
    showingHints: boolean;
    onShowingHints: () => void;
};

const censorBirdName = (text: string, birdName: string) =>
    text.split(new RegExp(`(${birdName})`, "gi")).map((part, i) =>
        part.toLowerCase() === birdName.toLowerCase()
            ? <BirdIcon key={i} />
            : <p>{part}</p>
    );

const FIRST_HINT_THRESHOLD = 8;
const SECOND_HINT_THRESHOLD = 12;


export function GameHints({ hints, hintTitles, showingHints, birdName, totalGuesses, onShowingHints }: GameHintsProps) {
    const censorBirdName = (hint: string) =>
        hint.split(new RegExp(`(${birdName})`, "gi")).map((part, i) =>
            part.toLowerCase() === birdName.toLowerCase()
                ? <BirdIcon key={i} />
                : part
        );

    return (
        <div className={styles.hints}>
            {!showingHints && totalGuesses >= FIRST_HINT_THRESHOLD && (
                <button onClick={onShowingHints}>Show a hint?</button>
            )}
            {showingHints && totalGuesses >= FIRST_HINT_THRESHOLD && (
                <p><strong>{hintTitles[0]}: </strong>{censorBirdName(hints[0])}</p>
            )}
            {showingHints && totalGuesses >= SECOND_HINT_THRESHOLD && hints.length > 1 && (
                <p><strong>{hintTitles[1]}: </strong>{censorBirdName(hints[1])}</p>
            )}
        </div>
    );
}