import { useState } from 'react';
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
import { GameResults, scoreBreakdown } from './components/game_results';
import { addSoftHyphenToLongWords } from './utils/soft_hyphen';
import { GameHints } from './components/game_hints';
import {
  getAverageScore,
  getDate,
  LocalStorageKey,
  readBooleanFromStorage,
  readNumberArrayFromStorage,
  readNumberFromStorage,
  readStringArrayFromStorage
} from './utils/storage_tools';

const TOTAL_BIRDS = birdData.length;


// function getUniqueColours(): string[] {
//   return [...new Set(birdData.flatMap(bird => bird.colours))];
// }



function autocompleteSort(a: string, b: string, query: string) {
  const q = query.toLowerCase();

  const aStarts = a.toLowerCase().startsWith(q);
  const bStarts = b.toLowerCase().startsWith(q);

  return (
    Number(bStarts) - Number(aStarts) ||
    a.localeCompare(b)
  );
}



function simplifyText(text: string) {
  return text.toLowerCase().replace(/[\s\p{P}]/gu, '');
}

function App() {

  const [today] = useState<string>(getDate(0));
  const [targetIndex] = useState<number>(Math.floor(seedrandom(today)() * TOTAL_BIRDS));
  // console.log(birdData[(targetIndex + 1) % TOTAL_BIRDS].name);
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
    const playStreak = readNumberFromStorage(LocalStorageKey.PlayStreak) || 0;
    if (lastGameDate === getDate(-1) && lastGameWon) {
      localStorage.setItem(LocalStorageKey.PlayStreak, String(playStreak + 1));
      console.log(`Incrementing streak from ${playStreak}`);
    } else if (lastGameDate !== today) {
      localStorage.setItem(LocalStorageKey.PlayStreak, '1');
      console.log("Resetting streak...");
    }
    if (!lastGameWasToday) {
      // localStorage.removeItem(LocalStorageKey.LastGameDate);
      localStorage.setItem(LocalStorageKey.LastGameDate, today);
      localStorage.removeItem(LocalStorageKey.GameWon);
      localStorage.removeItem(LocalStorageKey.GuessIndices);
      localStorage.removeItem(LocalStorageKey.ShowHints);
      localStorage.removeItem(LocalStorageKey.HintsShown);
    }
    return lastGameWasToday && lastGameWon;
  });
  const [googleAnalytics, _setGoogleAnalytics] = useState<boolean>(readBooleanFromStorage(LocalStorageKey.Cheater));

  const [hintsShown, setHintsShown] = useState<string[]>(() => {
    const lastGameDate = localStorage.getItem(LocalStorageKey.LastGameDate);
    const lastGameWasToday = lastGameDate === today;
    return lastGameWasToday ? readStringArrayFromStorage(LocalStorageKey.HintsShown) : [];
  });
  // useEffect(() => {
  //   const currentGameHistory = readNumberArrayFromStorage(LocalStorageKey.GameHistory);
  //   if (currentGameHistory.includes(1)) {
  //     localStorage.setItem(LocalStorageKey.Cheater, 'true');
  //     setGoogleAnalytics(true);
  //   }
  // }, []);


  const targetBird = birdData[targetIndex];

  const hints = [
    "Description: " + targetBird.description,
    "Did you know: " + targetBird.did_you_know,
    "Similar Species: " + targetBird.similar_species,
    "Call description: " + targetBird.call_description,
  ].filter(value => !value.endsWith("Unspecified"));

  const guessedBirdNames = guessIndices.map(birdIndex => birdData[birdIndex].name.toLowerCase());

  const allBirdSuggestions = birdData.map((bird, index) => { return { value: bird, label: bird.name, index: index } });
  const query = inputValue.trim().toLowerCase();
  const suggestions = query.length < 2
    ? [] :
    allBirdSuggestions.filter(
      birdSuggestion =>
        // birdSuggestion.label.toLowerCase().includes(query)
        simplifyText(birdSuggestion.label).includes(simplifyText(query))
        && !guessedBirdNames.includes(birdSuggestion.label.toLowerCase()));

  const playStreak = readNumberFromStorage(LocalStorageKey.PlayStreak) || 1;

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

      const currentScore = scoreBreakdown(totalGuesses, hintsShown.length, playStreak)
      const gamePointsHistory: number[] = readNumberArrayFromStorage(LocalStorageKey.GamePointsHistory);
      gamePointsHistory.push(currentScore.finalScore);
      localStorage.setItem(LocalStorageKey.GamePointsHistory, JSON.stringify(gamePointsHistory));

    }
    setCurrentGuessIndex(null);
    setInputValue("");
    setGuessIndices(previousGuesses => {
      return [...previousGuesses, guessIndex];
    });
  }

  function handleShowingHint(hintTitle: string) {
    const newHintsShownList = [...hintsShown, hintTitle];
    localStorage.setItem(LocalStorageKey.HintsShown, JSON.stringify(newHintsShownList));
    setHintsShown(prev => [...prev, hintTitle]);
  }

  const selectedBird = currentGuessIndex == null ? null : birdData[currentGuessIndex];



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
            totalUsedHints={hintsShown.length}
            isCheater={googleAnalytics}
            playStreak={playStreak} />
        )}
        {((!gameWon && hints.length > 0 && guessIndices.length >= 8) || gameWon) && <GameHints
          hints={hints}
          hintsShown={hintsShown}
          birdName={targetBird.name}
          // onShowingHint={(hintTitle) => setHintsShown(prev => [...prev, hintTitle])}
          onShowingHint={handleShowingHint}
          showEverything={gameWon}
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
            <div className={styles.guessRow} key={guessIndex}>
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
