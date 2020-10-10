export interface HotKey {
    description: string;
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    callback: (down: boolean) => void;
}

export type HotKeyMod = "ctrl" | "alt" | "shift";
export function hotKey(
    modifiers: HotKeyMod[],
    key: string,
    description: string,
    callback: (down: boolean) => void
): HotKey {
    return {
        key,
        description,
        ctrl: modifiers.includes("ctrl"),
        alt: modifiers.includes("alt"),
        shift: modifiers.includes("shift"),
        callback,
    };
}

export function hotKeyPress(modifiers: HotKeyMod[], key: string, description: string, callback: () => void) {
    return hotKey(modifiers, key, description, (down) => {
        if (down) callback();
    });
}

export function hotKeyRelease(modifiers: HotKeyMod[], key: string, description: string, callback: () => void) {
    return hotKey(modifiers, key, description, (down) => {
        if (!down) callback();
    });
}
