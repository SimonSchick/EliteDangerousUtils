export type EDPosition = [number, number, number];

export const locations = {
    Sol: <EDPosition>[0, 0, 0],
    Core: <EDPosition>[25.21875, -20.90625, 25899.96875],
}

/**
 * Calculates the euclidian distance between 2 positions.
 */
export function starSystemDistance (a: EDPosition, b: EDPosition): number {
    return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
}
