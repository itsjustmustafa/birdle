import { Copy, Image, Trophy } from 'lucide-react';
import styles from './game_results.module.css';
import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { ScoreRow } from './score_row';
import html2canvas from 'html2canvas';

export type GameResultsProps = {
    totalGuesses: number;
    answer: string;
    date: string;
    averageTotalGuesses: string;
    totalUsedHints: number;
    isCheater: boolean;
    playStreak: number;
}

type ScoreBreakdown = {
    baseScore: number;
    finalScore: number;
    totalGuessesDelta: number;
    totalHintsSubtracted: number;
    noHintBonus: number;
    totalStreakAdded: number;
}

export function scoreBreakdown(totalGuesses: number, totalHints: number, playStreak: number): ScoreBreakdown {
    const baseScore = 50;
    const totalGuessesDelta = totalGuesses <= 10 ? 11 - totalGuesses : -totalGuesses;
    const totalHintsSubtracted = 5 * totalHints;
    const noHintBonus = totalHints > 0 ? 0 : 5;
    const totalStreakAdded = playStreak;
    const finalScore = Math.max(0, 50 + totalGuessesDelta - totalHintsSubtracted + totalStreakAdded + noHintBonus);
    return {
        baseScore: baseScore,
        finalScore: finalScore,
        totalGuessesDelta: totalGuessesDelta,
        totalHintsSubtracted: totalHintsSubtracted,
        noHintBonus: noHintBonus,
        totalStreakAdded: totalStreakAdded,
    }
}

function plural(word: string, count: number) {
    const single = count == 1;

    const wordBank = [
        ["time", "times"],
        ["guess", "guesses"]
    ];

    const pluralPair = wordBank.find(pair => pair[0] === word || pair[1] === word);

    return pluralPair !== undefined ? (single ? pluralPair[0] : pluralPair[1]) : word;
}



export function GameResults({
    totalGuesses,
    answer,
    date,
    averageTotalGuesses,
    totalUsedHints,
    isCheater,
    playStreak
}: GameResultsProps) {
    const [copied, setCopied] = useState<boolean>(false);
    const [showScoreToast, setShowScoreToast] = useState<boolean>(false);
    const [toastIsClosing, setToastIsClosing] = useState<boolean>(false);
    const toastRef = useRef<HTMLDivElement>(null);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scores = scoreBreakdown(totalGuesses, totalUsedHints, playStreak);

    // console.log(scores)


    // ** birdle **
    // 2026 -08 - 31
    // 2 guesses • 66 points
    // No Hints
    // Average Guesses: 2.0
    // https://mzza.xyz/birdle/

    function copyResults() {
        if (!isCheater) {

            navigator.clipboard.writeText(
                `**birdle**\n` +
                `${date}\n` +
                `${totalGuesses} ${plural("guess", totalGuesses)} • ${scores.finalScore} points\n` +
                (totalUsedHints > 0 ? `(${totalUsedHints} ${plural("hint", totalUsedHints)} used)` : "No Hints") + "\n" +
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

    const copyAsImage = async (): Promise<void> => {
        if (!toastRef.current) return;

        try {
            const canvas = await html2canvas(toastRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                onclone: (clonedDocument) => {
                    const clonedToast = clonedDocument.querySelector(
                        `.${styles.toast}`
                    ) as HTMLElement | null;

                    if (!clonedToast) return;

                    clonedToast.style.left = "auto";
                    clonedToast.style.top = "auto";
                    clonedToast.style.transform = "none";
                    clonedToast.style.animation = "none";
                },
                ignoreElements: (element) => {
                    return element.classList.contains(styles.shareButtons);
                },
            });

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });

            if (!blob) {
                throw new Error('Failed to generate toast image');
            }

            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob,
                }),
            ]);
        } catch (error) {
            console.error('Failed to copy toast as image:', error);
        }
    };

    function handleOpenToast() {
        setShowScoreToast(true);
    }

    function handleCloseToast() {
        setToastIsClosing(true);
    }

    function handleToastAnimationEnd(e: React.AnimationEvent<HTMLDivElement>) {
        console.log("animation ended!!!");
        if (e.animationName === styles.toastOutAnimation) {
            setShowScoreToast(false);
            setToastIsClosing(false);
        }
    }

    return (
        <div className={styles.results}>
            <p>You guessed <strong>{answer}</strong> in <strong>{`${totalGuesses} ${plural("guess", totalGuesses)}`}</strong>
            </p>

            <button className={styles.scoresButton} onClick={handleOpenToast}>
                <p>Results</p>
                <Trophy size={16} />
            </button>
            {showScoreToast && (
                <>
                    <span className={clsx(styles.screenShadow, toastIsClosing && styles.fadeOut)} onClick={handleCloseToast} />
                    <div
                        className={clsx(styles.toast, toastIsClosing && styles.toastOut)}
                        onAnimationEnd={handleToastAnimationEnd}
                        ref={toastRef}>
                        {/* <button className={styles.closeButton} onClick={handleCloseToast}>
                            <X size={16} />
                        </button> */}
                        <p className={styles.date}>{date}</p>
                        <a className={styles.link} href="https://mzza.xyz/birdle/">{"mzza.xyz/birdle"}</a>
                        <h1>{scores.finalScore} pts</h1>
                        <ScoreRow
                            description='You guessed the bird!'
                            scoreDelta={scores.baseScore}
                            emoji={'✅'}
                        />
                        {totalGuesses <= 10 &&
                            <ScoreRow
                                description={`Took only ${totalGuesses} ${plural("guess", totalGuesses)}!`}
                                scoreDelta={scores.totalGuessesDelta}
                                emoji={'🧐'}
                            />
                        }
                        {totalGuesses > 10 &&
                            <ScoreRow
                                description={`Took ${totalGuesses} ${plural("guess", totalGuesses)}`}
                                scoreDelta={scores.totalGuessesDelta}
                                emoji={'🤔'}
                            />
                        }
                        {totalUsedHints === 0 &&
                            <ScoreRow
                                description={'No Hints Used!'}
                                scoreDelta={scores.noHintBonus}
                                emoji={'🧠'}
                            />
                        }
                        {totalUsedHints > 0 &&
                            <ScoreRow
                                description={`${totalUsedHints} ${plural("hint", totalUsedHints)} used`}
                                scoreDelta={-scores.totalHintsSubtracted}
                                emoji='👀'
                            />
                        }
                        <ScoreRow
                            description={`${playStreak}-day streak!`}
                            scoreDelta={scores.totalStreakAdded}
                            emoji='🔥'
                        />
                        <div className={styles.shareButtons}>
                            <button className={styles.copyTextButton} onClick={copyResults}>
                                {copied ? (isCheater ? "Ya goddamn cheater" : "Copied Results") : "Copy Results"}
                                <Copy size={16} />
                            </button>

                            <button className={styles.copyImageButton} onClick={copyAsImage}>
                                Copy Image
                                <Image size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}