/**
 * @since 2.10.0
 */
import { constant } from './function'
import { Functor, Functor1, Functor2, Functor2C, Functor3, Functor3C, Functor4 } from './Functor'
import { HKT, Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from './HKT'
import { getObjectSemigroup, Semigroup } from './Semigroup'
import { Functor as IDFunctor, apS } from './Identity'

type UnionToIntersection<T> = 
  (T extends any ? (x: T) => any : never) extends 
  (x: infer R) => any ? R : never

type EnsureLiteral<K extends string> = 
  string extends K ? never : 
  [K] extends [UnionToIntersection<K>] ? K : never

type TestLiteral<K extends string> = 
  string extends K ? unknown : 
    [K] extends [UnionToIntersection<K>] ? K : unknown

type EnsureLiteralTuple<A extends string[]> = unknown extends {
  [Key in keyof A]: A[Key] extends string ? TestLiteral<A[Key]> : unknown
}[number] ? never : A

type EnsurePropertyNotExist<T, K extends string> = 
  keyof T extends never ? T
    : K extends keyof T ? never : T

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export const pick = <Keys extends string[]>(
  ...ks: EnsureLiteralTuple<Keys>
) => <A extends { readonly [key in Keys[number]]: unknown }>(
  x: A,
): { readonly [K in Keys[number]]: A[K] } => {
  const o = {} as { [K in Keys[number]]: A[K] }
  /* eslint-disable */
  for (const k of ks as Keys[number][]) {
    o[k] = x[k]
  }
  /* eslint-enable */
  return o
}

export const omit = <Keys extends string[]>(
  ...ks: EnsureLiteralTuple<Keys>
) => <A extends { readonly [key in Keys[number]]: unknown }>(
   x: A,
): { readonly [K in Exclude<keyof A, Keys[number]>]: A[K] } => {
  const o = {} as { [K in Exclude<keyof A, Keys[number]>]: A[K] }
  for (const k of Object.keys(x) as Keys[number][]) {
    if (!ks.includes(k)) {
      (o as any)[k] = x[k]
    }
  }
  return o
}

export const insertAt: <
  Key extends string,
  Obj1, 
  Val
>(
  prop: Key extends keyof Obj1 ? never : Key,
  value: Val
) => <
  Obj2 extends { readonly [k in string as k extends Key ? never : k]: unknown }
>(
  obj: keyof Obj1 extends never ? EnsurePropertyNotExist<Obj2, Key> : Obj1
) => keyof Obj1 extends never ? {
  readonly [K in keyof Obj2 | Key]: K extends keyof Obj2 ? Obj2[K] : Val;
} : {
  readonly [K in keyof Obj1 | Key]: K extends keyof Obj1 ? Obj1[K] : Val;
} = apS as any

export const renameAt = <
  Obj1, 
  OldKey extends (keyof Obj1 extends never ? string : keyof Obj1), 
  NewKey extends string
>(
  from: OldKey,
  to: Exclude<NewKey, keyof Obj1>
) => <Obj2 extends { readonly [k in OldKey]: unknown }>(
  { [from]: val, ...rest }: keyof Obj1 extends never ? EnsurePropertyNotExist<Obj2, NewKey> : Obj1
): OldKey extends keyof Obj1 ? {
  readonly [K in Exclude<keyof Obj1, OldKey> | NewKey]: 
    K extends keyof Obj1 ? Obj1[K] : Obj1[OldKey]
} : {
  readonly [K in Exclude<keyof Obj2, OldKey> | NewKey]: 
    K extends keyof Obj2 ? Obj2[K] : Obj2[OldKey]
} => ({ [to]: val, ...rest }) as any

export function mapAtE<F extends URIS4>(F: Functor4<F>): {
  <S, R, E, A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => Kind4<F, S, R, E, B>):
    (a: Kind4<F, S, R, E, A>) => Kind4<F, S, R, E, { readonly [K in keyof A]: K extends P ? B : A[K] }>
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>):
    (a: HKT<F, A>) => HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }>
}
export function mapAtE<F extends URIS3>(F: Functor3<F>): {
  <R, E, A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => Kind3<F, R, E, B>):
    (a: Kind3<F, R, E, A>) => Kind3<F, R, E, { readonly [K in keyof A]: K extends P ? B : A[K] }>
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>):
    (a: HKT<F, A>) => HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }>
}
export function mapAtE<F extends URIS3, E>(F: Functor3C<F, E>): {
  <R, A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => Kind3<F, R, E, B>):
    (a: Kind3<F, R, E, A>) => Kind3<F, R, E, { readonly [K in keyof A]: K extends P ? B : A[K] }>
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>):
    (a: HKT<F, A>) => HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }>
}
export function mapAtE<F extends URIS2>(F: Functor2<F>): {
  <E, A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => Kind2<F, E, B>):
    (a: Kind2<F, E, A>) => Kind2<F, E, { readonly [K in keyof A]: K extends P ? B : A[K] }>
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>):
    (a: HKT<F, A>) => HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }>
}
export function mapAtE<F extends URIS2, E>(F: Functor2C<F, E>): {
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => Kind2<F, E, B>):
    (a: Kind2<F, E, A>) => Kind2<F, E, { readonly [K in keyof A]: K extends P ? B : A[K] }>
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>):
    (a: HKT<F, A>) => HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }>
}
export function mapAtE<F extends URIS>(F: Functor1<F>): {
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => Kind<F, B>): 
    (a: Kind<F, A>) => Kind<F, { readonly [K in keyof A]: K extends P ? B : A[K] }>
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>):
   (a: HKT<F, A>) => HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }>
}
export function mapAtE<F>(F: Functor<F>): 
  <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>) => 
  (a: HKT<F, A>) => HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }> {
  return <A, P extends keyof A, B>(prop: P, f: (ap: A[P]) => HKT<F, B>) => 
    (a: HKT<F, A>): HKT<F, { readonly [K in keyof A]: K extends P ? B : A[K] }> => {
      return F.map(a, ({[prop]: input, ...rest }) => ({ [prop]: f(input), ...rest}) as any)
    }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * Return a semigroup which works like `Object.assign`.
 *
 * @example
 * import { getAssignSemigroup } from 'fp-ts/struct'
 *
 * interface Person {
 *   readonly name: string
 *   readonly age: number
 * }
 *
 * const S = getAssignSemigroup<Person>()
 * assert.deepStrictEqual(S.concat({ name: 'name', age: 23 }, { name: 'name', age: 24 }), { name: 'name', age: 24 })
 *
 * @category instances
 * @since 2.10.0
 */
// tslint:disable-next-line: deprecation
export const getAssignSemigroup: <A extends object = never>() => Semigroup<A> = getObjectSemigroup


// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

export const mapAt: <
  Obj1,
  Key extends keyof Obj1 extends never ? string : keyof Obj1,
  ValOut,
  ValIn
>(
  prop: Key extends string ? EnsureLiteral<Key> : never, 
  f: Key extends keyof Obj1 ? (ap: Obj1[Key]) => ValOut : (ap: ValIn) => ValOut
) => <
  Obj2 extends { [k in Key]: ValIn }
>(
  a: keyof Obj1 extends never ? Obj2 : Obj1
) => Key extends keyof Obj1 ? { 
  readonly [K in keyof Obj1]: K extends Key ? ValOut : Obj1[K] 
} : {
  readonly [K in keyof Obj2]: K extends Key ? ValOut : Obj2[K] 
} = mapAtE(IDFunctor)

export const modifyAt: <
  Obj1,
  Key extends keyof Obj1 extends never ? string : keyof Obj1,
  Val
>(
  prop: Key extends string ? EnsureLiteral<Key> : never,
  f: Key extends keyof Obj1 ? (o: Obj1[Key]) => Obj1[Key] : (o: Val) => Val
) => <
  Obj2 extends { [k in Key]: Val }
>(
  o: keyof Obj1 extends never ? Obj2 : Obj1
) => keyof Obj1 extends never ? Obj2 : Obj1 = mapAt as any

export const updateAt: <
  Obj1, 
  Key extends keyof Obj1 extends never ? string : keyof Obj1,
  Val
>(
  prop: Key extends string ? EnsureLiteral<Key> : never,
  ap: Key extends keyof Obj1 ? Obj1[Key] : Val
) => <
  Obj2 extends { [k in Key]: Val }
>(
  o: keyof Obj1 extends never ? Obj2 : Obj1
) => keyof Obj1 extends never ? Obj2 : Obj1 = (prop, ap) => modifyAt(prop, constant(ap) as any)
