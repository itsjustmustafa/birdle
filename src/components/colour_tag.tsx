import clsx from 'clsx';
import styles from './colour_tag.module.css';

export type ColourName =
    | 'Black'
    | 'White'
    | 'Brown'
    | 'Grey'
    | 'sheen: Glossy'
    | 'sheen: Metallic'
    | 'Green'
    | 'Purple'
    | 'Red'
    | 'Yellow'
    | 'Blue'
    | 'Orange'
    | 'Pink';

const colourClasses: Record<ColourName, string> = {
    'Black': styles.black,
    'White': styles.white,
    'Brown': styles.brown,
    'Grey': styles.grey,
    'sheen: Glossy': styles.glossy,
    'sheen: Metallic': styles.metallic,
    'Green': styles.green,
    'Purple': styles.purple,
    'Red': styles.red,
    'Yellow': styles.yellow,
    'Blue': styles.blue,
    'Orange': styles.orange,
    'Pink': styles.pink,
};

const colourLabels: Record<ColourName, string> = {
    'Black': 'Black',
    'White': 'White',
    'Brown': 'Brown',
    'Grey': 'Grey',
    'sheen: Glossy': 'Glossy Sheen',
    'sheen: Metallic': 'Metallic Sheen',
    'Green': 'Green',
    'Purple': 'Purple',
    'Red': 'Red',
    'Yellow': 'Yellow',
    'Blue': 'Blue',
    'Orange': 'Orange',
    'Pink': 'Pink',
};

export type ColourTagProps = {
    colourName: ColourName;
};

export function ColourTag({ colourName }: ColourTagProps) {
    return (
        <p className={clsx(styles.tag, colourClasses[colourName])}>
            {colourLabels[colourName]}
        </p>
    );
}