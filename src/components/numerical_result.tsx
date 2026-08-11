import styles from './numerical_result.module.css';
import clsx from "clsx";

export type NumericalResultProps = {
    value: string;
    targetValue: string;
    displayFormat: (value: number) => string;
}

export function NumericalResult({ value, targetValue, displayFormat }: NumericalResultProps) {

    const anythingIsUnspecified = value == "Unspecified" || targetValue == "Unspecified";
    const displayValue = anythingIsUnspecified ? "No data" : displayFormat(Number.parseInt(value));
    const valueTooLow = anythingIsUnspecified ? false : Number.parseInt(value) < Number.parseInt(targetValue);
    const valueTooHigh = anythingIsUnspecified ? false : Number.parseInt(value) > Number.parseInt(targetValue);

    return (
        <div className={clsx(styles.container,
            value == targetValue && styles.correct,
            value !== targetValue && styles.incorrect,
            valueTooLow && styles.tooLow,
            valueTooHigh && styles.tooHigh,
            anythingIsUnspecified && styles.unspecified,
        )} >
            {displayValue}
        </div>
    );
}