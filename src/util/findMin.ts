
export function findMin<T>(list: { [key: string]: T }, predicate: (value: T, idx: number, list: { [key: string]: T }) => number): [T, number];
export function findMin<T>(list: T[] , predicate: (value: T, idx: string, list: T[]) => number): [T, number];
export function findMin<T>(list: T[] | { [key: string]: T }, predicate: (value: T, idx: string | number, list: T[] |{ [key: string]: T }) => number): [T, number] {
    let min = Number.POSITIVE_INFINITY;
    let ret: T;
    if(Array.isArray(list)) {
        for(let i = 0;i < list.length;++i) {
            const res = predicate(list[i], i, list);
            if (res < min) {
                min = res;
                ret = list[i];
            }
        }
        return [ret, min];
    }
    for (const key in list) {
        const res = predicate(list[key], key, list);
        if (res < min) {
            min = res;
            ret = list[key];
        }
    }
    return [ret, min];
}
