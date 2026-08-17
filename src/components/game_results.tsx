import { Copy } from 'lucide-react';
import styles from './game_results.module.css';
import { useRef, useState } from 'react';

export type GameResultsProps = {
    totalGuesses: number;
    answer: string;
    date: string;
    averageTotalGuesses: string;
    totalUsedHints: number;
    isCheater: boolean;
}


export function GameResults({ totalGuesses, answer, date, averageTotalGuesses, totalUsedHints, isCheater }: GameResultsProps) {
    const [copied, setCopied] = useState<boolean>(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const guessesString = totalGuesses > 1 ? "guesses" : "guess";

    function copyResults() {
        if (!isCheater) {

            navigator.clipboard.writeText(
                `**birdle**\n` +
                `${date}\n${totalGuesses} ${guessesString}` + (totalUsedHints > 0 ? ` (${totalUsedHints} ${totalUsedHints > 1 ? "hints" : "hint"} used)` : "") + "\n" +
                `Average Guesses: ${averageTotalGuesses}\n` +
                `https://mzza.xyz/birdle/`
            );
        } else {
            navigator.clipboard.writeText("You think ur so smart, huh?");
        }

        setCopied(true);

        if (timeoutRef.current) {
            clearInterval(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => setCopied(false), 2000);

    }


    return (
        <div className={styles.results}>
            <p>You guessed <strong>{answer}</strong> in <strong>{`${totalGuesses} ${guessesString}`}</strong>
            </p>

            <button className={styles.copyButton} onClick={copyResults}>
                <p>
                    {copied ? (isCheater ? "Ya goddamn cheater" : "Copied") : "Share"}
                </p>
                <Copy size={16} />
            </button>
        </div>
    );
}