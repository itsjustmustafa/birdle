import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './autocomplete_input.module.css';
import clsx from 'clsx';

export type Suggestion = {
    value: any;
    label: string;
    index: number;
}

export type AutocompleteInputProps = {
    inputValue: string;
    suggestions: Suggestion[];
    selection: Suggestion | null;
    placeholder: string;
    enabled: boolean;
    onInputChange: (value: string) => void;
    onSelected: (selectionIndex: number | null) => void;
    onSubmit: (index: number) => void;
}

export function AutocompleteInput({
    inputValue,
    suggestions,
    selection,
    placeholder,
    enabled,
    onInputChange,
    onSelected,
    onSubmit,
}: AutocompleteInputProps) {
    const [navigatedIndex, setNavigatedIndex] = useState<number | null>(null);
    const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    useEffect(() => {
        setNavigatedIndex(null);
    }, [inputValue, suggestions])

    useEffect(() => {
        if (navigatedIndex !== null) {
            suggestionRefs.current[navigatedIndex]?.scrollIntoView({ block: "nearest" });
        } else {
            suggestionRefs.current[0]?.scrollIntoView({ block: "nearest" });
        }
    }, [navigatedIndex])

    function handleBlur() {
        setIsFocused(false);
        setNavigatedIndex(null);
    }

    function handleFocus() {
        setIsFocused(true);
    }

    function handleInputChanged(value: string) {
        if (selection !== null && selection?.label !== value) {
            onSelected(null);
        }
        onInputChange(value);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        if (event.key == 'ArrowDown') {
            event.preventDefault();

            setNavigatedIndex(previousSelectedIndex =>
                previousSelectedIndex == null
                    ? 0
                    : (previousSelectedIndex + 1) % suggestions.length
            );
        }
        if (event.key == 'ArrowUp') {
            event.preventDefault();

            setNavigatedIndex(previousSelectedIndex =>
                previousSelectedIndex == null
                    ? suggestions.length - 1
                    : (previousSelectedIndex - 1 + suggestions.length) % suggestions.length
            );
        }

        if (event.key == 'Enter') {
            event.preventDefault();

            if (navigatedIndex !== null) {
                // User has navigated to a suggestion and pressed enter
                onSubmit(suggestions[navigatedIndex].index);
            } else if (selection !== null) {
                // User has a selection loaded in the component and pressed enter
                onSubmit(selection.index);
            } else {
                // User is pressing enter on whatever they have typed in
                const selectionFromQuery = suggestions.find(suggestion => suggestion.label.toLowerCase() == inputValue.trim().toLowerCase());
                if (!!selectionFromQuery) {
                    onSubmit(selectionFromQuery.index);
                }
            }
        }
    }

    function selectSuggestion(index: number): void {
        onInputChange(suggestions[index].label);
        onSelected(suggestions[index].index);
    }

    return (
        <div
            className={styles.autocomplete}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <input
                type='text'
                value={inputValue}
                onChange={e => handleInputChanged(e.target.value)}
                placeholder={placeholder}
                disabled={!enabled}
            />
            {enabled && isFocused && selection == null && suggestions.length > 0 && <div className={styles.dropdown}>
                {suggestions.map((suggestion, index) =>
                    <div
                        className={clsx(
                            styles.suggestion,
                            navigatedIndex == index && styles.selected
                        )}
                        ref={element => { suggestionRefs.current[index] = element; }}
                        key={index}
                        onMouseDown={(e) => { e.preventDefault(); selectSuggestion(index) }}
                    >{suggestion.label}</div>
                )}
            </div>}
        </div >
    );
}