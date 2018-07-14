export type ArrayPredicate<T> = (value: T, idx: number, list: T[]) => number;
export type ObjectPredicate<T> = (value: T, idx: string, list: { [key: string]: T }) => number;
export type Predicate<T> = ArrayPredicate<T> | ObjectPredicate<T>;

export function findMin<T>(list: { [key: string]: T }, predicate: ObjectPredicate<T>): [T | void, number];
export function findMin<T>(list: T[], predicate: ArrayPredicate<T>): [T | void, number];
export function findMin<T>(
    list: T[] | { [key: string]: T },
    predicate: Predicate<T>,
): [T | void, number] {
    let min = Number.POSITIVE_INFINITY;
    let ret: T | void;
    if (Array.isArray(list)) {
        for (let i = 0; i < list.length; ++i) {
            const res = (<ArrayPredicate<T>>predicate)(list[i], i, list);
            if (res < min) {
                min = res;
                ret = list[i];
            }
        }
        return [ret, min];
    }
    for (const [key, value] of Object.entries(list)) {
        const res = (<ObjectPredicate<T>>predicate)(value, key, list);
        if (res < min) {
            min = res;
            ret = value;
        }
    }
    return [ret, min];
}
