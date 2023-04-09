// Just copy object type as a new type
// Use to produce clean object type with final props (it unboxing all intermediate types)
// Example:
// CombinedObjectFromTwo<Config2, CombinedObjectFromTwo<Pick<Config, "x"> & Pick<CombinedObjectFromTwo<ObjectWithPrefixesProps<ConfigP, "p">, unknown>, "py"> & Pick<...> & CombinedProperties<...>, unknown>>
// ->
// { f: string; x: number; py: number; }
export type CleanRecursively<T> = T extends infer U ? { [K in keyof U]: CleanRecursively<U[K]> } : never

// Combine list of object type in type that contains properties from all input types
// Spread<[{x: string}, {y: number}, ...]> -> {x: string, y: number, ...}
export type Spread<A extends [...any]> = A extends [infer L, ...infer R] ? L & Spread<R> : unknown
