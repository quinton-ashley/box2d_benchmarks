export const DEG_TO_RAD: number = Math.PI / 180;
export const RAD_TO_DEG: number = 180 / Math.PI;

export function sinDeg(angle: number) {
    return Math.sin(DEG_TO_RAD * angle);
}

export function cosDeg(angle: number) {
    return Math.cos(DEG_TO_RAD * angle);
}
