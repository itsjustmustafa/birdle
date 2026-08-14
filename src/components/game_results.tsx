import { Copy } from 'lucide-react';
import styles from './game_results.module.css';
import { useRef, useState } from 'react';

export type GameResultsProps = {
    totalGuesses: number;
    answer: string;
    date: string;
    averageTotalGuesses: string;
    usedHints: boolean;
    isCheater: boolean;
}


export function GameResults({ totalGuesses, answer, date, averageTotalGuesses, usedHints, isCheater }: GameResultsProps) {
    const [copied, setCopied] = useState<boolean>(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const guessesString = totalGuesses > 1 ? "guesses" : "guess";

    function copyResults() {
        if (!isCheater) {

            navigator.clipboard.writeText(
                `**birdle**\n` +
                `${date}\n${totalGuesses} ${guessesString}` + (usedHints ? " (Used hints)" : "") + "\n" +
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