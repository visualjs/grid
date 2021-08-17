const cssPrefix = 'v-grid-';

export function selector(selector: string): string {
    return selector.replaceAll('.', '.' + cssPrefix);
}
