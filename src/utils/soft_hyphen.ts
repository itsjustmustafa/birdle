export const addSoftHyphenToLongWords = (text: string) =>
    text.replace(/\S{11,}/g, word => {
        const midpoint = Math.floor(word.length / 2);
        return word.slice(0, midpoint) + '\u00AD' + word.slice(midpoint);
    });