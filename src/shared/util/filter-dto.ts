export const filterDto = <T extends object>(dto: T): Partial<T> => {
  return Object.entries(dto).reduce((acc, [key, val]) => {
    if (val !== undefined) acc[key as keyof T] = val
    return acc
  }, {} as Partial<T>)
}
