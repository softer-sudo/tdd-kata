import { FunctionLookup, MathFunction } from './evaluator';

export class FunctionRegistry implements FunctionLookup {
  private readonly functions = new Map<string, MathFunction>();

  register(name: string, fn: MathFunction): void {
    this.functions.set(name, fn);
  }

  get(name: string): MathFunction | undefined {
    return this.functions.get(name);
  }
}

// Compile-only stub: an empty registry until the default-functions test drives the real thing.
export function createDefaultRegistry(): FunctionRegistry {
  return new FunctionRegistry();
}
