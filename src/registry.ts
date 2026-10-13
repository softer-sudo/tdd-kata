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

export function createDefaultRegistry(): FunctionRegistry {
  const registry = new FunctionRegistry();
  registry.register('abs', Math.abs);
  registry.register('sqrt', Math.sqrt);
  registry.register('max', Math.max);
  registry.register('min', Math.min);
  return registry;
}
