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

export class Evaluator {
  constructor(
    private readonly functions: FunctionLookup,
    private readonly logger: Logger,
  ) {}

  evaluate(expr: Expr): number {
    if (expr.type === 'number') return expr.value;
    if (expr.type === 'binary') return this.evaluate(expr.left) + this.evaluate(expr.right);
    throw new Error(`Cannot evaluate '${expr.type}' nodes yet`);
  }
}
