import { FunctionLookup, MathFunction } from './evaluator';

// Compile-only stub: gives the first registry test something to fail against.
export class FunctionRegistry implements FunctionLookup {
  register(_name: string, _fn: MathFunction): void {}

  get(_name: string): MathFunction | undefined {
    return undefined;
  }
}
