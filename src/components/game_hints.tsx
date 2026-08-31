import { BirdIcon } from "./bird_icon";
import styles from './game_hints.module.css';

export type GameHintsProps = {
    hints: string[];
    hintsShown: string[];
    birdName: string;
    showEverything: boolean;
    onShowingHint: (hintTitle: string) => void;
};

const censorBirdName = (hint: string, birdName: string) =>
    hint.split(new RegExp(`(${birdName})`, "gi")).map((part, i) =>
        part.toLowerCase() === birdName.toLowerCase()
            ? <BirdIcon key={i} />
            : part
    );

export function GameHints({
    hints,
    hintsShown,
    birdName,
    showEverything,
    onShowingHint,
}: GameHintsProps) {
    return (
        <div className={styles.hints}>
            {hints.map((hint) => {
                const [title, ...textParts] = hint.split(": ");
                const text = textParts.join(": ");

                const isShown = showEverything || hintsShown.includes(title);

                if (isShown) {
                    return (
                        <p key={title}>
                            <strong>{title}: </strong>
                            {showEverything ? text : censorBirdName(text, birdName)}
                        </p>
                    );
                }

                return (
                    <button
                        key={title}
                        onClick={() => onShowingHint(title)}
                    >
                        Reveal <i>{title}</i>
                    </button>
                );
            })}
        </div>
    );
}