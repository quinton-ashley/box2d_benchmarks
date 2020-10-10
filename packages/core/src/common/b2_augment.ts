export type b2Augmentation<T extends { [s: string]: any }> = {
    [P in keyof T]?: (original: T[P], ...args: Parameters<T[P]>) => ReturnType<T[P]>;
};

export function b2_augment<T extends { [s: string]: any }>(host: T, augmentations: b2Augmentation<T>) {
    for (const key of Object.keys(augmentations)) {
        const augmentation = augmentations[key] as (this: T, original: (...args: any[]) => any, ...args: any[]) => any;
        const original = host[key];
        // eslint-disable-next-line func-names
        const wrapper = function (this: T, ...args: any[]) {
            return augmentation.call(this, original.bind(this), ...args);
        } as any;
        Object.defineProperty(wrapper, "name", { value: key });
        host[key as keyof T] = wrapper;
    }
}

export type b2Writeable<T> = { -readonly [P in keyof T]: T[P] };
