import clsx from 'clsx';
import styles from './score_row.module.css'

export type ScoreRowProps = {
    description: string;
    scoreDelta?: number;
    emoji?: string;
}

export function ScoreRow({ description, scoreDelta, emoji }: ScoreRowProps) {
    return (
        <div className={clsx(styles.scoreRow, scoreDelta && scoreDelta >= 0 && styles.good, scoreDelta < 0 && styles.bad)}>
            <span className={styles.description}>
                {emoji && <p className={styles.emoji}>{emoji}</p>}
                {description}
            </span>
            {scoreDelta && <p className={styles.score}>{(scoreDelta && scoreDelta >= 0 ? "+" : "") + scoreDelta}</p>}
        </div>
    );
}