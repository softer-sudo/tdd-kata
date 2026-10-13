import { Evaluator, FunctionLookup, Logger } from '../src/evaluator';
import { BinaryOp, Expr } from '../src/parser';

// Both injected dependencies are test doubles: no real registry, no real logging.
const registry: jest.Mocked<FunctionLookup> = { get: jest.fn() };
const logger: jest.Mocked<Logger> = { debug: jest.fn(), warn: jest.fn() };

// ASTs are built by hand so these tests stay independent of the parser.
const n = (value: number): Expr => ({ type: 'number', value });
const bin = (op: BinaryOp, left: Expr, right: Expr): Expr => ({ type: 'binary', op, left, right });

let evaluator: Evaluator;

beforeEach(() => {
  jest.resetAllMocks();
  evaluator = new Evaluator(registry, logger);
});

describe('Evaluator', () => {
  it('evaluates a number node to its value', () => {
    expect(evaluator.evaluate(n(42))).toBe(42);
  });

  it('adds the operands of a + node', () => {
    expect(evaluator.evaluate(bin('+', n(1), n(2)))).toBe(3);
  });

  it.each([
    ['-', 7, 2, 5],
    ['*', 3, 4, 12],
    ['/', 8, 2, 4],
  ] as const)('applies the %s operator', (op, left, right, expected) => {
    expect(evaluator.evaluate(bin(op, n(left), n(right)))).toBe(expected);
  });
});
