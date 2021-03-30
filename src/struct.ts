/**
 *
 * A 'struct' is a heterogeneous `ReadonlyRecord`, often an `interface`.
 * Many of these functions have a `Record._WithIndex` counterpart.
 * e.g. struct.mapS <-> Record.mapWithIndex
 *
 * @since 3.0.0
 */
 import { URIS3, Kind3, URIS2, Kind2, URIS, Kind, URIS4, Kind4, HKT } from './HKT'
 import * as R from './ReadonlyRecord'
 import { Option, fromNullable, fromPredicate, some, Applicative as OptionApplicative } from './Option'
 import { Either, right, left } from './Either'
 import { Ord } from './Ord'
 import { Ord as StringOrd } from './string'
 import { Apply4, Apply3, Apply3C, Apply2, Apply2C, Apply1, Apply } from './Apply'
 import { Semigroup } from './Semigroup'
 import * as _ from './internal'
 import { Predicate } from './Predicate'
 import { Refinement } from './Refinement'
import { identity, pipe } from './function'
 
 type NonEmpty<R> = keyof R extends never ? never : R extends object ? R : never
 type RR = Readonly<Record<string, unknown>>
 
 /**
  * Given a struct of functions map a corresponding struct of values.
  *
  * @example
  * import { pipe } from 'fp-ts/function'
  * import { evolve } from 'fp-ts/struct'
  *
  * assert.deepStrictEqual(
  *   pipe(
  *     { a: 'a', b: true, c: 'abc' },
  *     evolve({
  *       a: (s) => s.length,
  *       b: (b) => !b,
  *     })
  *   ),
  *   { a: 1, b: false, c: 'abc' }
  * )
  *
  * @category combinators
  * @since 3.0.0
  */
 export const evolve = <A, B extends { [k in keyof A]?: (val: A[k]) => unknown }>(f: B) => (
   a: NonEmpty<A>
 ): { [key in keyof A]: B[key] extends (a: never) => infer C ? C : A[key] } =>
   R.mapWithIndex((k, r) => {
     const fk = f[k as keyof A]
     return fk ? fk(r as any) : r
   })(a as RR) as any
 
 /**
  * Pick a set of keys from a `Record`. The value-level equivalent of the `Pick`
  * type.
  *
  * @example
  * import { pick } from 'fp-ts/struct';
  *
  * type MyType = { a: number; b: string; c: Array<boolean> };
  * const picked = pick<MyType>()(['a', 'c']);
  *
  * assert.deepStrictEqual(picked({ a: 1, b: 'two', c: [true] }), { a: 1, c: [true] });
  *
  * @since 3.0.0
  */
  export const pick = <A>() => <K extends keyof A>(ks: Array<K>) => (
   x: A,
 ): Pick<A, K> => {
   // I don't believe there's any reasonable way to model this sort of
   // transformation in the type system without an assertion - at least here
   // it's in a single reused place
   const o = {} as Pick<A, K>
 
   /* eslint-disable */
   for (const k of ks) {
     o[k] = x[k]
   }
   /* eslint-enable */
 
   return o
 }
 
 /**
  * Omit a set of keys from a `Record`. The value-level equivalent of the `Omit`
  * type.
  *
  * @example
  * import { omit } from 'fp-ts/struct';
  *
  * const sansB = omit(['b']);
  *
  * assert.deepStrictEqual(sansB({ a: 1, b: 'two', c: [true] }), { a: 1, c: [true] });
  *
  * @since 3.0.0
  */
 export const omit = <K extends string>(ks: Array<K>) => <
   V,
   A extends Record<K, V>
 >(
   x: Partial<A>,
 ): Omit<A, K> => {
   const y = { ...x }
 
   /* eslint-disable */
   for (const k of ks) {
     delete y[k]
   }
   /* eslint-enable */
 
   return y as Omit<A, K>
 }
 
 /**
  * Refines a struct based on some of its properties
  *
  * @example
  * import { refine } from 'fp-ts/struct';
  * import { some } from 'fp-ts/Option';
  *
  * const sansB = omit(['b']);
  *
  * assert.deepStrictEqual(
  *   pipe(
  *     { a: 'a', b: 1, c: 'abc' },
  *     refine({
  *       a: (a): a is 'a' => a === 'a',
  *       b: (b) => b === 1
  *     }),
  *   ),
  *   some({ a: 'a', b: 1, c: 'abc' })
  * );
  *
  * @since 3.0.0
  */
 export const refine = <A, B extends { [K in keyof A]?: Predicate<A[K]> | Refinement<A[K], A[K]> }>(predicates: B) => (
   fa: NonEmpty<A>
 ): Option<{
   [K in keyof A]: B[K] extends (a: any) => a is infer C ? C : A[K]
 }> => R.traverseWithIndex(StringOrd)(OptionApplicative)((k, v) => {
   const p = predicates[k as keyof A]
   return p !== undefined ? fromPredicate(p as any)(v) : some(v)
 })(fa as RR) as any
 
 /**
  * Parses a struct based on some of its properties
  *
  * @example
  * import { parse } from 'fp-ts/struct';
  * import { right } from 'fp-ts/Option';
  *
  * assert.deepStrictEqual(
  *   pipe(
  *     { a: 'a', b: 1, c: 'abc' }, 
  *     _.parse({ 
  *       a: (a): E.Either<string, number> => a === 'a' ? E.right(1) : E.left(`Not 'a'`), 
  *       b: (b): E.Either<number, string> => b === 1 ? E.right('a') : E.left(42), 
  *     })
  *   ),
  *   E.right({ a: 1, b: 'a', c: 'abc' })
  * )
  * assert.deepStrictEqual(
  *   pipe(
  *     { a: 'b', b: 1, c: 'abc' }, 
  *     _.parse({ 
  *       a: (a): E.Either<string, number> => a === 'a' ? E.right(1) : E.left(`Not 'a'`), 
  *       b: (b): E.Either<number, string> => b === 1 ? E.right('a') : E.left(42), 
  *     })
  *   ),
  *   E.left({ a: `Not 'a'` })
  * )
  *
  * @since 3.0.0
  */
 export const parse = <R, B extends { [K in keyof R]?: (val: R[K]) => Either<unknown, unknown> }>(f: B) => (
   fa: NonEmpty<R>
 ): Either<
   { [K in keyof B]?: B[K] extends (a: never) => Either<infer E, unknown> ? E : never },
   { [K in keyof R]: B[K] extends (a: never) => Either<unknown, infer A> ? A : R[K] }
 > => {
   const { left: failed, right: parsed } = R.partitionMapWithIndex((k, v) => {
     const fk = f[k as keyof R]
     if (fk) {
       const r = fk(v as any)
       return r
     } else {
       const r = right(v)
       return r
     }
   })(fa as RR)
   return Object.keys(parsed).length === Object.keys(fa).length ? right(parsed) : left(failed) as any
 }

const isOption = (a: unknown): a is Option<unknown> => (
  typeof a === 'object' && !!a && '_tag' in a && ((
    (a as Record<string, unknown>)._tag === 'Some' && `value` in a && Object.keys(a).length === 2
  ) || ((a as Record<string, unknown>)._tag === 'None')))

 /**
  * Given a heterogeneous struct of Options, eliminate
  * all keys that are `None` & return a struct of the
  * existing values.
  *
  * @example
  * import { compactS } from 'fp-ts/struct'
  * import * as O from 'fp-ts/Option'
  *
  * assert.deepStrictEqual(
  *   compactS({
  *     foo: O.some(123),
  *     bar: 22,
  *     baz: O.some('abc')
  *   }),
  *   { foo: 123, bar: 22, baz: 'abc', }
  * )
  *
  * @category combinators
  * @since 3.0.0
  */
export const compactS = <A>(r: A): {
  [K in keyof A as A[K] extends Option<unknown> ? K : never]?:
    A[K] extends Option<infer B> ? B : never
} & {
  [K in keyof A as A[K] extends Option<unknown> ? never : K]: A[K]
} => {
  const {left, right} = R.partition(isOption)(r as RR)
  return {...left, ...pipe(right, R.filterMap(identity))} as any
}
 
 /**
  * Wrap each key in heterogeneous struct of nullable values in `Option`.
  *
  * Note: cannot properly wrap optional/partial keys.
  *
  * @example
  * import { unCompact } from 'fp-ts/struct'
  * import * as O from 'fp-ts/Option'
  *
  * assert.deepStrictEqual(
  *   unCompact({ foo: 123, bar: undefined, baz: 'abc' }),
  *   { foo: O.some(123), bar: O.none, baz: O.some('abc') }
  * )
  *
  * @category combinators
  * @since 3.0.0
  */
 export const unCompact = <A>(
   a: NonEmpty<A>
 ): {
   [K in keyof A]: Option<NonNullable<A[K]>>
 } => {
   const ks = Object.keys(a) as Array<keyof A>
   const ops = {} as { [K in keyof A]: Option<NonNullable<A[K]>> }
   for (const key of ks) {
     ops[key] = fromNullable(a[key])
   }
   return ops
 }

 /**
  * Runs an separate action for each value in a struct, and accumulates the results.
  *
  * @example
  * import { pipe } from 'fp-ts/function'
  * import { traverseS } from 'fp-ts/struct'
  * import { Ord } from 'fp-ts/string'
  * import * as O from 'fp-ts/Option'
  *
  * assert.deepStrictEqual(
  *   pipe(
  *     { a: 1, b: 'b', c: 'abc' },
  *     traverseS(Ord)(O.Apply)({
  *       a: (n) => n <= 2 ? O.some(n.toString()) : O.none,
  *       b: (b) => b.length <= 2 ? O.some(b.length) : O.none
  *     })
  *   ),
  *   O.some({ a: '1', b: 1, c: 'abc' })
  * )
  *
  * @category combinators
  * @since 3.0.0
  */
 export function traverseS(
   O: Ord<string>
 ): {
   <F extends URIS4>(F: Apply4<F>): <
     S,
     R,
     E,
     A,
     B extends { [key in keyof A]?: (val: A[key]) => Kind4<F, S, R, E, unknown> }
   >(
     f: B
   ) => (
     ta: NonEmpty<A>
   ) => Kind4<
     F,
     S,
     R,
     E,
     {
       [key in keyof A]: B[key] extends (a: never) => Kind4<F, S, R, E, infer C> ? C : A[key]
     }
   >
   <F extends URIS3>(F: Apply3<F>): <R, E, A, B extends { [key in keyof A]?: (val: A[key]) => Kind3<F, R, E, unknown> }>(
     f: B
   ) => (
     ta: NonEmpty<A>
   ) => Kind3<
     F,
     R,
     E,
     {
       [key in keyof A]: B[key] extends (a: never) => Kind3<F, R, E, infer C> ? C : A[key]
     }
   >
   <F extends URIS3, E>(F: Apply3C<F, E>): <
     R,
     A,
     B extends { [key in keyof A]?: (val: A[key]) => Kind3<F, R, E, unknown> }
   >(
     f: B
   ) => (
     ta: NonEmpty<A>
   ) => Kind3<
     F,
     R,
     E,
     {
       [key in keyof A]: B[key] extends (a: never) => Kind3<F, R, E, infer C> ? C : A[key]
     }
   >
   <F extends URIS2>(F: Apply2<F>): <E, A, B extends { [key in keyof A]?: (val: A[key]) => Kind2<F, E, unknown> }>(
     f: B
   ) => (
     ta: NonEmpty<A>
   ) => Kind2<
     F,
     E,
     {
       [key in keyof A]: B[key] extends (a: never) => Kind2<F, E, infer C> ? C : A[key]
     }
   >
   <F extends URIS2, E>(F: Apply2C<F, E>): <A, B extends { [key in keyof A]?: (val: A[key]) => Kind2<F, E, unknown> }>(
     f: B
   ) => (
     ta: NonEmpty<A>
   ) => Kind2<
     F,
     E,
     {
       [key in keyof A]: B[key] extends (a: never) => Kind2<F, E, infer C> ? C : A[key]
     }
   >
   <F extends URIS>(F: Apply1<F>): <A, B extends { [key in keyof A]?: (val: A[key]) => Kind<F, unknown> }>(
     f: B
   ) => (
     ta: NonEmpty<A>
   ) => Kind<
     F,
     {
       [key in keyof A]: B[key] extends (a: never) => Kind<F, infer C> ? C : A[key]
     }
   >
   <F>(F: Apply<F>): <A, B extends { [key in keyof A]?: (val: A[key]) => HKT<F, unknown> }>(
     f: B
   ) => (
     ta: NonEmpty<A>
   ) => HKT<
     F,
     {
       [key in keyof A]: B[key] extends (a: never) => HKT<F, infer C> ? C : A[key]
     }
   >
 }
 export function traverseS(
   O: Ord<string>
 ): <F>(
   F: Apply<F>
 ) => <A extends R.ReadonlyRecord<string, unknown>, B extends { [key in keyof A]?: (val: A[key]) => HKT<F, unknown> }>(
   f: B
 ) => (
   ta: NonEmpty<A>
 ) => HKT<
   F,
   {
     [key in keyof A]: B[key] extends (a: never) => HKT<F, infer C> ? C : A[key]
   }
 > {
   return <F>(F: Apply<F>) => <A, B extends { [key in keyof A]?: (val: A[key]) => HKT<F, unknown> }>(f: B) => (
     ta: NonEmpty<A>
   ) => {
     const ks = R.keys(O)(ta) as ReadonlyArray<keyof A>
     const length = ks.length
     const fk = f[ks[0]]
     let fr = F.map((r) => ({ [ks[0]]: r }))(fk ? fk(ta[ks[0]] as any) : ta[ks[0]] as any) as HKT<
       F,
       {
         [key in keyof B]: B[key] extends (a: never) => HKT<F, infer C> ? C : never
       }
     >
     for (let i = 1; i < length; i++) {
       const fk = f[ks[i]]
       if (fk){
         fr = F.ap(fk(ta[ks[i]] as any))(
           F.map((r: any) => (b: any) => {
             r[ks[i]] = b
             return r
           })(fr)
         )
       } else {
         fr = F.map((r: any) => {
           r[ks[i]] = ta[ks[i]]
           return r
         })(fr)
       }
     }
     return fr as any
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
  * import { pipe } from 'fp-ts/function'
  *
  * interface Person {
  *   readonly name: string
  *   readonly age: number
  * }
  *
  * const S = getAssignSemigroup<Person>()
  * assert.deepStrictEqual(pipe({ name: 'name', age: 23 }, S.concat({ name: 'name', age: 24 })), { name: 'name', age: 24 })
  *
  * @category instances
  * @since 3.0.0
  */
 export const getAssignSemigroup = <A = never>(): Semigroup<A> => ({
   concat: (second) => (first) => Object.assign({}, first, second)
 })
 