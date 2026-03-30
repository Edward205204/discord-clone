import ms from 'ms'
import z from 'zod'

export function parseDurationToMs(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = ms(trimmed as Parameters<typeof ms>[0])
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined
}

export const durationToMs = (name: string) =>
  z
    .string()
    .trim()
    .min(1)
    .refine(
      (val) => {
        const n = parseDurationToMs(val)
        return n !== undefined && n > 0
      },
      { message: `${name} phải là khoảng thời gian hợp lệ (vd: 30s, 5m, 3h, 7d)` },
    )
    .transform((val) => parseDurationToMs(val) as number)
