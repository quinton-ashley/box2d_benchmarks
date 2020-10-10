export const classPrefix = (main: string, prefix?: string) => (prefix ? `${main} ${prefix}-${main}` : main);

export const testLabelToLink = (label: string) => `/${label.replace(/[^a-z0-9-]+/gi, "_")}`;
