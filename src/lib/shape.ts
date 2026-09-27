// the building blocks for checking anything from outside this browser (see
// check.ts, and each kind's own check): is it the right kind of value.

export type Obj = Record<string, unknown>;
export type Is = (x: unknown) => boolean;

export const obj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);
export const num = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
export const str = (x: unknown): x is string => typeof x === "string";
export const bool = (x: unknown) => typeof x === "boolean";
export const orNull = (is: Is) => (x: unknown) => x === null || is(x);
export const maybe = (is: Is) => (x: unknown) => x === undefined || is(x);
export const list = (is: Is) => (x: unknown) => Array.isArray(x) && x.every(is);
/** an id that's safe in a page address */
export const id = (x: unknown) => str(x) && /^[\w-]{1,64}$/.test(x);
export const oneOf = (...xs: string[]) => (x: unknown) => xs.includes(x as string);
