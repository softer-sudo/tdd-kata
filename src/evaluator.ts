import { Expr } from './parser';

export type MathFunction = (...args: number[]) => number;

/** Port: how the evaluator finds callable functions by name. */
export interface FunctionLookup {
  get(name: string): MathFunction | undefined;
}

/** Port: where the evaluator reports what it is doing. */
export interface Logger {
  debug(message: string): void;
  warn(message: string): void;
}

// Compile-only stub: gives the first evaluator test something to fail against.
export class Evaluator {
  constructor(
    private readonly functions: FunctionLookup,
    private readonly logger: Logger,
  ) {}

  evaluate(_expr: Expr): number {
    return 0;
  }
}
