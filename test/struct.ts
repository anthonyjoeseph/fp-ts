import { pipe } from '../src/function'
import * as O from '../src/Option'
import * as E from '../src/Either'
import * as _ from '../src/Struct'
import * as S from '../src/string'
import * as U from './util'

const sp = (s: string): s is 'a' => s === 'a'
const np = (n: number): n is 1 => n === 1

describe('struct', () => {
  describe('pipeables', () => {
    it('evolve', () => {
      U.deepStrictEqual(
        pipe(
          { a: 'a', b: true, c: 'abc' },
          _.evolve({
            a: (s) => s.length,
            b: (b) => !b,
          })
        ),
        { a: 1, b: false, c: 'abc' }
      )
      // should ignore non own properties
      const x: Record<'b', number> = Object.create({ a: 1 })
      x.b = 1
      U.deepStrictEqual(pipe(x, _.evolve({ b: (b) => b > 0 })), { b: true })
    })

    it('refine', () => {
      U.deepStrictEqual(
        pipe({ a: 'a', b: 1 }, _.refine({ a: sp, b: np })),
        O.some({ a: 'a', b: 1 })
      )
      U.deepStrictEqual(
        pipe({ a: 'a', b: 2 }, _.refine({ a: sp, b: np })),
        O.none
      )

      U.deepStrictEqual(
        pipe(
          { a: 'a', b: 1, c: 'abc' },
          _.refine({
            a: (a): a is 'a' => a === 'a',
            b: (b) => b === 1
          }),
        ),
        O.some({ a: 'a', b: 1, c: 'abc' })
      )
    })

    it('parse', () => {
      U.deepStrictEqual(
        pipe(
          { a: 'a', b: 1, c: 'abc' }, 
          _.parse({ 
            a: (a): E.Either<string, number> => a === 'a' ? E.right(1) : E.left(`Not 'a'`), 
            b: (b): E.Either<number, string> => b === 1 ? E.right('a') : E.left(42), 
          })
        ),
        E.right({ a: 1, b: 'a', c: 'abc' })
      )
      U.deepStrictEqual(
        pipe(
          { a: 'b', b: 1, c: 'abc' }, 
          _.parse({ 
            a: (a): E.Either<string, number> => a === 'a' ? E.right(1) : E.left(`Not 'a'`), 
            b: (b): E.Either<number, string> => b === 1 ? E.right('a') : E.left(42), 
          })
        ),
        E.left({ a: `Not 'a'` })
      )
    })

    it('compactS', () => {
      U.deepStrictEqual(
        _.compactS({
          foo: O.none,
          bar: 22,
          baz: O.some('abc')
        }),
        { bar: 22, baz: 'abc' }
      )
      // should ignore non own properties
      const o: { readonly b: O.Option<number> } = Object.create({ a: 1 })
      U.deepStrictEqual(pipe(o, _.compactS), {})
    })

    it('unCompactS', () => {
      U.deepStrictEqual(_.unCompact({ foo: 123, bar: undefined, baz: 'abc' }), {
        foo: O.some(123),
        bar: O.none,
        baz: O.some('abc')
      })
    })

    it('traverseS', () => {
      U.deepStrictEqual(
        pipe(
          { a: 1, b: 'b', c: 'abc' },
          _.traverseS(S.Ord)(O.Apply)({
            a: (n) => (n <= 2 ? O.some(n.toString()) : O.none),
            b: (b) => (b.length <= 2 ? O.some(b.length) : O.none)
          })
        ),
        O.some({ a: '1', b: 1, c: 'abc' })
      )
      U.deepStrictEqual(
        pipe(
          { a: 1, b: '2' },
          _.traverseS(S.Ord)(O.Apply)({
            a: (n) => (n >= 2 ? O.some(n.toString()) : O.none),
            b: () => O.some(3)
          })
        ),
        O.none
      )
    })

    describe('instances', () => {
      it('getAssignSemigroup', () => {
        type T = {
          readonly foo?: number
          readonly bar: string
        }
        const foo: T = {
          foo: 123,
          bar: '456'
        }
        const bar: T = {
          bar: '123'
        }
        const S = _.getAssignSemigroup<T>()
        U.deepStrictEqual(pipe(foo, S.concat(bar)), Object.assign({}, foo, bar))
      })
    })
  })
})
