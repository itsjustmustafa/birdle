import { useEffect, useState } from 'react';
import seedrandom from 'seedrandom';
import styles from './App.module.css';
import birdData from './data/birds_full_data.json';
import { AutocompleteInput } from './components/autocomplete_input';
import { ConservationStatusMap, type StateStatuses } from './components/conservation_status_map';
import { MultiItemResult } from './components/multi_item_result';
import clsx from 'clsx';
import { ColourTag, type ColourName } from './components/colour_tag';
import { NumericalResult } from './components/numerical_result';
import { FittedImage } from './components/fitted_image';
import birdle_logo_outline from './assets/birdle_logo_outline.png';
import { GameResults } from './components/game_results';
import { addSoftHyphenToLongWords } from './utils/soft_hyphen';
import { GameHints } from './components/game_hints';

const TOTAL_BIRDS = birdData.length;


// function getUniqueColours(): string[] {
//   return [...new Set(birdData.flatMap(bird => bird.colours))];
// }

const LocalStorageKey = {
  LastGameDate: "lastGameDate",
  GameWon: 'gameWon',
  GuessIndices: 'guessIndices',
  Date: 'date',
  GameHistory: 'history',
  ShowHints: 'showHints',
  Cheater: 'google-analytics::initialised',
} as const;

function autocompleteSort(a: string, b: string, query: string) {
  const q = query.toLowerCase();

  const aStarts = a.toLowerCase().startsWith(q);
  const bStarts = b.toLowerCase().startsWith(q);

  return (
    Number(bStarts) - Number(aStarts) ||
    a.localeCompare(b)
  );
}

function getTodaysDate() {
  const date = new Date();
  return date.toLocaleDateString('en-CA');
}

function readNumberArrayFromStorage(key: string): number[] {
  try {
    const array = JSON.parse(
      localStorage.getItem(key) ?? '[]'
    );

    return Array.isArray(array)
      && array.every(value => typeof value === 'number')
      ? array
      : [];
  } catch {
    return []
  }
}

function readBooleanFromStorage(key: string): boolean {
  return localStorage.getItem(key) == 'true';
}

function getAverageScore() {
  const allScores = readNumberArrayFromStorage(LocalStorageKey.GameHistory);
  return (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1);
}

function App() {

  const [today] = useState<string>(getTodaysDate());
  const [targetIndex] = useState<number>(Math.floor(seedrandom(today)() * TOTAL_BIRDS));
  console.log(birdData[(targetIndex + 1) % TOTAL_BIRDS].name);
  const [inputValue, setInputValue] = useState<string>("");
  const [currentGuessIndex, setCurrentGuessIndex] = useState<number | null>(null);
  const [guessIndices, setGuessIndices] = useState<number[]>(() => {
    const lastGameDate = localStorage.getItem(LocalStorageKey.LastGameDate);
    const lastGameWasToday = lastGameDate === today;

    if (!lastGameWasToday) {
      return [];
    }
    return readNumberArrayFromStorage(LocalStorageKey.GuessIndices);
  });

  const [gameWon, setGameWon] = useState<boolean>(() => {
    const lastGameDate = localStorage.getItem(LocalStorageKey.LastGameDate);
    const lastGameWon = readBooleanFromStorage(LocalStorageKey.GameWon);
    const lastGameWasToday = lastGameDate === today;
    if (!lastGameWasToday) {
      localStorage.removeItem(LocalStorageKey.LastGameDate);
      localStorage.removeItem(LocalStorageKey.GameWon);
      localStorage.removeItem(LocalStorageKey.GuessIndices);
      localStorage.removeItem(LocalStorageKey.ShowHints);
    }
    return lastGameWasToday && lastGameWon;
  });
  const [showingHints, setShowingHints] = useState<boolean>(() => {
    const lastGameDate = localStorage.getItem(LocalStorageKey.LastGameDate);
    const lastGameWasToday = lastGameDate === today;
    const showingHintsInStorage = readBooleanFromStorage(LocalStorageKey.ShowHints);
    return lastGameWasToday && showingHintsInStorage;
  });
  const [googleAnalytics, setGoogleAnalytics] = useState<boolean>(readBooleanFromStorage(LocalStorageKey.Cheater));

  // useEffect(() => {
  //   const currentGameHistory = readNumberArrayFromStorage(LocalStorageKey.GameHistory);
  //   if (currentGameHistory.includes(1)) {
  //     localStorage.setItem(LocalStorageKey.Cheater, 'true');
  //     setGoogleAnalytics(true);
  //   }
  // }, []);


  const targetBird = birdData[targetIndex];

  const hints = [targetBird.did_you_know, targetBird.call_description].filter(value => value !== "Unspecified");
  const hintTitles = [
    targetBird.did_you_know !== "Unspecified" && "Did you know",
    targetBird.call_description !== "Unspecifed" && "Call description"].filter(Boolean) as string[];

  const guessedBirdNames = guessIndices.map(birdIndex => birdData[birdIndex].name.toLowerCase());

  const allBirdSuggestions = birdData.map((bird, index) => { return { value: bird, label: bird.name, index: index } });
  const query = inputValue.trim().toLowerCase();
  const suggestions = query.length < 2
    ? [] :
    allBirdSuggestions.filter(
      birdSuggestion =>
        birdSuggestion.label.toLowerCase().includes(query)
        && !guessedBirdNames.includes(birdSuggestion.label.toLowerCase()));

  suggestions.sort((a, b) => autocompleteSort(a.label.toLowerCase(), b.label.toLowerCase(), query));

  function handleInputChange(value: string): void {
    setInputValue(value);
  }

  function handleSelected(selectionIndex: number | null): void {
    setCurrentGuessIndex(selectionIndex);
  }

  function handleSubmitGuess(guessIndex: number) {
    localStorage.setItem(LocalStorageKey.LastGameDate, today);
    localStorage.setItem(LocalStorageKey.GuessIndices, JSON.stringify([...guessIndices, guessIndex]));
    const totalGuesses = guessIndices.length + 1;
    if (guessIndex == targetIndex) {
      setGameWon(true);
      localStorage.setItem(LocalStorageKey.GameWon, 'true');
      const gameHistory: number[] = readNumberArrayFromStorage(LocalStorageKey.GameHistory);
      gameHistory.push(totalGuesses);
      localStorage.setItem(LocalStorageKey.GameHistory, JSON.stringify(gameHistory));
    }
    setCurrentGuessIndex(null);
    setInputValue("");
    setGuessIndices(previousGuesses => {
      return [...previousGuesses, guessIndex];
    });
  }

  const selectedBird = currentGuessIndex == null ? null : birdData[currentGuessIndex];

  function handleShowingHints() {
    setShowingHints(true);
    localStorage.setItem(LocalStorageKey.ShowHints, 'true');
  }

  return (
    <>
      <div className={styles.game}>
        <div className={styles.birdleTitle}>
          <div className={styles.birdleTitleBackground} />
          <img className={styles.birdleTitleForeground} src={birdle_logo_outline} />
        </div>
        <AutocompleteInput
          inputValue={inputValue}
          suggestions={suggestions}
          placeholder='Enter a bird name...'
          selection={selectedBird == null ? null : { value: selectedBird, label: selectedBird.name, index: currentGuessIndex as number }}
          onInputChange={handleInputChange}
          onSelected={handleSelected}
          onSubmit={handleSubmitGuess}
          enabled={!gameWon}
        />
        {gameWon && (
          <GameResults
            totalGuesses={guessIndices.length}
            answer={targetBird.name}
            date={today}
            averageTotalGuesses={getAverageScore()}
            usedHints={showingHints}
            isCheater={googleAnalytics}
          />
        )}
        {!gameWon && hints.length > 0 && guessIndices.length >= 8 && <GameHints
          showingHints={showingHints}
          hints={hints}
          hintTitles={hintTitles}
          totalGuesses={guessIndices.length}
          birdName={targetBird.name}
          onShowingHints={handleShowingHints}
        />}
        <div className={styles.table}>
          <div className={styles.titleRow}>
            <div className={clsx(styles.title, styles.nameCol)}>Name</div>
            <div className={clsx(styles.title, styles.imageCol)}>Image</div>
            <div className={clsx(styles.title, styles.multiItemCol)}>Taxonomy</div>
            <div className={clsx(styles.title, styles.smallTitle, styles.multiItemCol)}>Bird Shape</div>
            <div className={clsx(styles.title, styles.multiItemCol)}>Colours</div>
            <div className={clsx(styles.title, styles.smallTitle, styles.multiItemCol)}>Bird Groups</div>
            <div className={clsx(styles.title, styles.numericalCol)}>Avg. Size</div>
            <div className={clsx(styles.title, styles.numericalCol)}>Avg. Weight</div>
            <div className={clsx(styles.title, styles.smallTitle, styles.multiItemCol)}>Distinctive Features</div>
            <div className={clsx(styles.title, styles.smallTitle, styles.statusCol)}>Conservation Status</div>
          </div>
          {guessIndices.toReversed().map(guessIndex => (
            <div className={styles.guessRow}>
              <div className={clsx(
                styles.guess,
                styles.nameCol,
                birdData[guessIndex].name == targetBird.name && styles.correct
              )}><p>{addSoftHyphenToLongWords(birdData[guessIndex].name)}</p></div>
              <div className={clsx(styles.guess, styles.imageCol)}>
                <FittedImage src={birdData[guessIndex].image_url} url={birdData[guessIndex].url} key={`${guessIndex}_image`} />
              </div>
              <div className={clsx(styles.guess, styles.multiItemCol)}>
                <MultiItemResult items={[birdData[guessIndex].order, birdData[guessIndex].family]} targetItems={[targetBird.order, targetBird.family]} key={`${guessIndex}_taxonomy`} />
              </div>
              <div className={clsx(styles.guess, styles.multiItemCol)}>
                <MultiItemResult items={birdData[guessIndex].bird_shape} targetItems={targetBird.bird_shape} key={`${guessIndex}_shape`} />
              </div>
              <div className={clsx(styles.guess, styles.multiItemCol)}>
                <MultiItemResult
                  items={(birdData[guessIndex].colours as ColourName[]).map(colourName => <ColourTag colourName={colourName} />)}
                  targetItems={(targetBird.colours as ColourName[]).map(colourName => <ColourTag colourName={colourName} />)}
                  key={`${guessIndex}_colour`}
                />
              </div>
              <div className={clsx(styles.guess, styles.multiItemCol)}>
                <MultiItemResult items={birdData[guessIndex].bird_groups} targetItems={targetBird.bird_groups} key={`${guessIndex}_group`} />
              </div>
              <div className={clsx(styles.guess, styles.numericalCol)}>
                <NumericalResult value={birdData[guessIndex].average_size} targetValue={targetBird.average_size} displayFormat={(value) => `${value}cm`} key={`${guessIndex}_size`} />
              </div>
              <div className={clsx(styles.guess, styles.numericalCol)}>
                <NumericalResult value={birdData[guessIndex].average_weight} targetValue={targetBird.average_weight} displayFormat={(value) => `${value}g`} key={`${guessIndex}_weight`} />
              </div>
              <div className={clsx(styles.guess, styles.multiItemCol)}>
                <MultiItemResult items={birdData[guessIndex].distinctive_features} targetItems={targetBird.distinctive_features} key={`${guessIndex}_features`} />
              </div>
              <div className={clsx(styles.guess, styles.statusCol)}>
                <ConservationStatusMap statuses={birdData[guessIndex].conservation_status as StateStatuses} targetStatuses={targetBird.conservation_status as StateStatuses} key={`${guessIndex}_map`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>)
}

export default App
