import birdIconImage from '../assets/bird_icon.svg';
import styles from './bird_icon.module.css';

export function BirdIcon() {
    return <img className={styles.birdIconImage} src={birdIconImage} />
}