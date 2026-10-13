import { MathFunction } from '../src/evaluator';
import { FunctionRegistry } from '../src/registry';

describe('FunctionRegistry', () => {
  it('returns the function registered under a name', () => {
    const registry = new FunctionRegistry();
    const double: MathFunction = (x) => x * 2;

    registry.register('double', double);

    expect(registry.get('double')).toBe(double);
  });
});
