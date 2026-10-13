import { MathFunction } from '../src/evaluator';
import { createDefaultRegistry, FunctionRegistry } from '../src/registry';

describe('FunctionRegistry', () => {
  it('returns the function registered under a name', () => {
    const registry = new FunctionRegistry();
    const double: MathFunction = (x) => x * 2;

    registry.register('double', double);

    expect(registry.get('double')).toBe(double);
  });
});

describe('createDefaultRegistry', () => {
  it.each([
    ['abs', [-3], 3],
    ['sqrt', [9], 3],
    ['max', [1, 5, 3], 5],
    ['min', [4, 2, 8], 2],
  ] as const)('provides %s', (name, args, expected) => {
    expect(createDefaultRegistry().get(name)?.(...args)).toBe(expected);
  });
});
