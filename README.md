# tdd-kata

A tiny arithmetic expression parser/evaluator (**tokenizer → parser → evaluator**) written in TypeScript, built strictly test-first. The code is small on purpose; the point is the **history** (every behaviour was added as a red → green → refactor cycle you can replay with `git log`) and the **test design** (every unit is tested in isolation through dependency injection and Jest mocks).

```ts
import { createCalculator } from 'tdd-kata';

createCalculator().calculate('max(1, 2 + 3) * -2'); // -10
```

Supported: `+ - * /`, unary minus, parentheses, decimals, and function calls (`abs`, `sqrt`, `max`, `min` built in, more pluggable). Errors are descriptive: `Unexpected character '$' at position 2`, `Expected ')' but reached end of input`, `Division by zero`, `Unknown function 'foo'`.

## Quick start

```bash
npm install
npm test            # run the suite
npm run coverage    # suite + coverage table; fails below 100%
npm run build       # compile src/ to dist/
```

Plugging in your own function and logger (this is the dependency injection the tests rely on):

```ts
import { createCalculator, createDefaultRegistry } from 'tdd-kata';

const registry = createDefaultRegistry();
registry.register('double', (x) => x * 2);
const logger = { debug: console.log, warn: console.warn };

createCalculator({ registry, logger }).calculate('double(21)');
// logs "double(21) = 42", returns 42
```

Grammar (recursive descent, standard precedence, left-associative):

```
expression := term (('+' | '-') term)*
term       := unary (('*' | '/') unary)*
unary      := '-' unary | primary
primary    := number | '(' expression ')' | ident '(' [expression (',' expression)*] ')'
```

## The TDD cycle

The rule: **no production code without a failing test first.** Each behaviour went through the same loop, and each step is its own commit, labelled in the subject line:

| Label | What the commit contains | Suite state |
|---|---|---|
| `red:` | One new failing test (and nothing else that changes behaviour) | **fails**, by an assertion, never by a compile error |
| `green:` | The smallest production change that makes it pass | all green |
| `refactor:` | Cleanup only, no new behaviour, no test changes beyond types | all green |

The history has 37 `red`, 37 `green` and 5 `refactor` commits (plus a scaffold, a coverage-threshold `chore` and the README itself). The first tokenizer cycles read like this:

```
red:      tokenizer turns an integer into a number token
green:    tokenizer returns the input as a number token        <- "fake it"
red:      tokenizer separates numbers and operators            <- forces a real scanner
green:    scan digit runs as numbers, other characters as operators
red:      tokenizer ignores whitespace
green:    skip whitespace in the tokenizer
  ...
red:      tokenizer rejects unexpected characters
green:    throw on characters outside the grammar
refactor: name tokenizer predicates and extract readWhile
```

The later cycles show the design emerging from the tests rather than being planned up front. The parser starts as "number, operator, number", then `1 - 2 - 3` forces a left-folding loop, then `1 + 2 * 3` forces a second precedence level, then parentheses, unary minus and calls arrive, each from one failing test. The evaluator's four-way `switch (expr.type)` was forced by the compiler once the fourth node kind existed.

Replaying the history:

```bash
git log --reverse --format='%h %s'                      # the whole story
git log -E --grep='^(green|refactor)' --format='%h %s'     # only the points where the suite is green
git checkout <red-hash> && npm test                     # watch a specific failure
```

Every `red:` commit is broken by design, so use the `green`/`refactor` commits for `git bisect`.

Things worth knowing about how strictly the loop was applied:

- **Compile-only stubs.** TypeScript cannot run a test against an export that does not exist, and a missing import is a *compile* error, not a *failing test*. So the first `red:` of each new unit also contains a behaviour-free stub (returns `[]`, `0`, `undefined`) whose only job is to make the test fail on its assertion. The same goes for union members and option parameters that a test needs to type-check (`'unary'`, `'call'`, `CalculatorOptions`).
- **"Fake it" greens.** Early greens are deliberately naive (`return [{ type: 'number', text: input }]`); the next test is what forces the real implementation.
- **Two guard tests pass on arrival.** `accepts %s as an operator` (tokenizer) and `lets evaluator errors surface through the default wiring` (calculator) were added in a `red:` commit but already passed. They guard behaviour that the following `green:` step was about to touch. Their commit messages say so.
- **Three amended commits.** One `red:` was first committed with a compile error instead of an assertion failure and was amended right away; two commit messages had a wrong test count. Nothing else was rewritten.

## Mocking and dependency injection

The design rule: **a unit never constructs its collaborators; it receives them.** That makes every unit testable alone, with no `jest.mock('../some/module')` module-level patching anywhere.

```
                          createCalculator()   <- composition root: the only place real parts meet
                                  |
                              Calculator  --(CalculatorDeps)-->  tokenize, parse, evaluator
                                                                              |
                                                                  Evaluator(functions, logger)
                                                                        |            |
                                                              FunctionLookup      Logger      <- ports (interfaces)
                                                                        |
                                                                FunctionRegistry              <- default adapter
```

Two ports are injected into `Evaluator` through its constructor (`src/evaluator.ts`):

```ts
export interface FunctionLookup { get(name: string): MathFunction | undefined }
export interface Logger         { debug(message: string): void; warn(message: string): void }

new Evaluator(functions, logger)
```

`Calculator` receives its three pipeline stages the same way (`CalculatorDeps`), and `createCalculator({ registry?, logger? })` wires the real defaults while letting callers override either one.

What is real and what is a double in each test file:

| Unit under test | Collaborators | In its tests |
|---|---|---|
| `tokenize` | none, it is a pure function | nothing to isolate |
| `parse` | the tokenizer's output | tokens are **hand-built**, the tokenizer is never imported |
| `Evaluator` | `FunctionLookup`, `Logger`, the parser's output | `jest.Mocked<FunctionLookup>` and `jest.Mocked<Logger>` injected through the constructor; ASTs are **hand-built** |
| `FunctionRegistry` | none, it wraps a `Map` | real object |
| `Calculator` | `tokenize`, `parse`, `evaluator` | all three are `jest.fn()` |
| `createCalculator` | everything | the one deliberate **integration** test: real parts, plus an injected fake registry and logger |

An example from `test/evaluator.test.ts`, showing that the call is resolved through the injected registry and that the already-evaluated arguments reach it:

```ts
const registry: jest.Mocked<FunctionLookup> = { get: jest.fn() };
const logger: jest.Mocked<Logger> = { debug: jest.fn(), warn: jest.fn() };

it('calls the function found in the injected registry with evaluated arguments', () => {
  const fn = jest.fn().mockReturnValue(99);
  registry.get.mockReturnValue(fn);

  const result = evaluator.evaluate(call('f', n(1), bin('+', n(2), n(3))));

  expect(registry.get).toHaveBeenCalledWith('f');
  expect(fn).toHaveBeenCalledWith(1, 5);   // 2 + 3 was evaluated before the call
  expect(result).toBe(99);                 // the function's result is passed through
});
```

How the doubles are kept honest:

- Mocks sit **only on injected ports**. The assertions check the contract at that boundary (which name was looked up, which arguments arrived, which message was logged), not internals.
- Doubles return **sentinel values that cannot be produced by accident**: the `Calculator` test feeds `'seven'` through mocked stages and expects `123` back, so it only passes if the data really flows `tokenize → parse → evaluate` and the evaluator's return value is what comes out.
- Expected values are **hand-computed literals** (`7 - 2 → 5`, `1 + 2 * 3` as a spelled-out tree), never derived with the code under test.
- Each failure path gets its own double setup: an unknown function is `registry.get.mockReturnValue(undefined)`, and the test also asserts `logger.debug` was *not* called.

## Coverage

`npm run coverage` (Jest, `ts-jest`) on 50 tests:

```
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------|---------|----------|---------|---------|-------------------
All files     |     100 |      100 |     100 |     100 |                   
 evaluator.ts |     100 |      100 |     100 |     100 |                   
 index.ts     |     100 |      100 |     100 |     100 |                   
 parser.ts    |     100 |      100 |     100 |     100 |                   
 registry.ts  |     100 |      100 |     100 |     100 |                   
 tokenizer.ts |     100 |      100 |     100 |     100 |                   
--------------|---------|----------|---------|---------|-------------------
```

100% is also enforced as a threshold in `package.json`, so `npm run coverage` fails if it ever drops. It is reachable here because the code was only ever written to satisfy a failing test: there are no defensive branches that no test asked for.

Coverage only says lines ran, so a one-off **mutation spot check** backs it up: 24 hand-made mutants (drop `/` from the operator set, swap a binary node's operands, make unary minus a no-op, skip the term level, reverse call arguments, make `min` behave like `max`, never log, never warn, empty default registry, and so on) were applied one at a time, and the suite failed on an assertion for every one. This was run by hand and is not part of the repo, so treat it as evidence about the suite at the time of writing, not as a guarantee.

## Layout

```
src/
  tokenizer.ts   string -> Token[]            (pure)
  parser.ts      Token[] -> Expr (AST)        (pure)
  evaluator.ts   Expr -> number               Evaluator(FunctionLookup, Logger) + the two ports
  registry.ts    FunctionRegistry + defaults  (default FunctionLookup)
  index.ts       Calculator, createCalculator (composition root) and the public exports
test/            one test file per source file
```
