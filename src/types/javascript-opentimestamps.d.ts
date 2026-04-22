// Shim types pour javascript-opentimestamps (lib CommonJS sans .d.ts).
// Usage restreint : seul notre code dans src/lib/opentimestamps.ts consomme ce module.
declare module 'javascript-opentimestamps' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const DetachedTimestampFile: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Ops: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function stamp(detached: any): Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function verify(proof: any, original: any): Promise<Map<string, { timestamp: number; height: number }>>
}
