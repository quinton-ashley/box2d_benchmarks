export interface HotKey {
    description: string;
    key: string;
    callback: (down: boolean) => void;
}

export function hotKey(key: string, description: string, callback: (down: boolean) => void): HotKey {
    return {
        key,
        description,
        callback,
    };
}

export function hotKeyPress(key: string, description: string, callback: () => void) {
    return hotKey(key, description, (down) => {
        if (down) callback();
    });
}

export function hotKeyRelease(key: string, description: string, callback: () => void) {
    return hotKey(key, description, (down) => {
        if (!down) callback();
    });
}
