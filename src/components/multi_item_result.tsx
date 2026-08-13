import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import styles from './multi_item_result.module.css';
import clsx from "clsx";
import { addSoftHyphenToLongWords } from '../utils/soft_hyphen';

export type MultiItemResultProps = {
    items: (string | ReactNode)[]
    targetItems: (string | ReactNode)[]
}


type ComparisonResult = 'correct' | 'partial' | 'incorrect';

const evaluateListsUnordered = (
    listA: (string | ReactNode)[],
    listB: (string | ReactNode)[],
): ComparisonResult => {
    if (!listA.length && !listB.length) return 'correct';
    if (!listA.length || !listB.length) return 'incorrect';

    const equal = (a: string | ReactNode, b: string | ReactNode) =>
        typeof a === 'string' || typeof b === 'string'
            ? a === b
            : isValidElement(a) &&
            isValidElement(b) &&
            a.type === b.type &&
            JSON.stringify(a.props) === JSON.stringify(b.props);

    const remaining = [...listB];
    let matches = 0;

    for (const a of listA) {
        const i = remaining.findIndex(b => equal(a, b));
        if (i !== -1) {
            remaining.splice(i, 1);
            matches++;
        }
    }

    return matches === 0
        ? 'incorrect'
        : matches === listA.length && matches === listB.length
            ? 'correct'
            : 'partial';
};



export function MultiItemResult({ items, targetItems }: MultiItemResultProps) {
    const result = evaluateListsUnordered(items, targetItems);


    return (
        <div className={clsx(styles.container,
            result == 'correct' && styles.correct,
            result == 'incorrect' && styles.incorrect,
            result == 'partial' && styles.partial
        )} >
            {items.map(item => typeof item === 'string' ? <p className={styles.textItem}>{addSoftHyphenToLongWords(item)}</p> : <>{item}</>)}
        </div>
    );
}