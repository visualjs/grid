
// modify from: https://github.com/lgarron/clipboard-polyfill

export type ClipboardItems = ClipboardItemInterface[];

export type PresentationStyle = "unspecified" | "inline" | "attachment";

// We name this `ClipboardItemInterface` instead of `ClipboardItem` because we
// implement our polyfill from the library as `ClipboardItem`.
export interface ClipboardItemInterface {
    // Safari 13.1 implements `presentationStyle`:
    // https://webkit.org/blog/10855/async-clipboard-api/
    readonly presentationStyle?: PresentationStyle; // [optional here, non-optional in spec]
    readonly lastModified?: number; // [optional here, non-optional in spec]
    readonly delayed?: boolean; // [optional here, non-optional in spec]

    readonly types: string[];

    getType(type: string): Promise<Blob>;
}

export interface Clipboard extends EventTarget {
    read(): Promise<ClipboardItems>;
    readText(): Promise<string>;
    write(data: ClipboardItems): Promise<void>;
    writeText(data: string): Promise<void>;
}

const originalNavigator = typeof navigator === "undefined" ? undefined : navigator;

const originalNavigatorClipboard:
  | Clipboard
  | undefined = originalNavigator?.clipboard as any;

const originalNavigatorClipboardReadText:
    | (() => Promise<string>)
    | undefined = originalNavigatorClipboard?.readText?.bind(
        originalNavigatorClipboard
    );

export const originalNavigatorClipboardWriteText:
  | ((data: string) => Promise<void>)
  | undefined = originalNavigatorClipboard?.writeText?.bind(
  originalNavigatorClipboard
);

export function readTextFromClipboard(): Promise<string> {

    if (originalNavigatorClipboardReadText) {
        return originalNavigatorClipboardReadText();
    }

    throw new Error("Read from clipboard is not supported in your browser.");
}

// modify from: https://gist.github.com/lgarron/d1dee380f4ed9d825ca7
export function writeTextToClipboard(str: string) {

    if (originalNavigatorClipboardWriteText) {
        return originalNavigatorClipboardWriteText(str);
    }

    return new Promise<void>(function (resolve, reject) {
        var success = false;
        function listener(e: ClipboardEvent) {
            e.clipboardData.setData("text/plain", str);
            e.preventDefault();
            success = true;
        }
        document.addEventListener('copy', listener);
        document.execCommand('copy');
        document.removeEventListener('copy', listener);
        success ? resolve() : reject();
    });
};
