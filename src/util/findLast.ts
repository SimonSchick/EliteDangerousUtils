export function findLast<T>(list: T[], predicate: (value: T, idx: number, list: T[]) => boolean): T {
    for(let i = list.length - 1;i >= 0;--i) {
        if (predicate(list[i], i, list)) {
            return list[i];
        }
    }
    return undefined;
}
