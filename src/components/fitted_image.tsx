import styles from './fitted_image.module.css';
import clsx from "clsx";

export type FittedImageProps = {
    src: string;
    url?: string;
}

export function FittedImage({ src, url = "" }: FittedImageProps) {

    return (
        <div
            className={clsx(styles.imageContainer, url !== "" && styles.link)}
            onClick={() => url !== "" && window.open(url, '_blank', 'noopener,noreferrer')}
        >
            <img className={styles.backgroundImage} src={src} />
            <img className={styles.foregroundImage} src={src} />
        </div>
    );
}