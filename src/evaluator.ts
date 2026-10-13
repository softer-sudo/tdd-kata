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
    switch (expr.type) {
      case 'number':
        return expr.value;
      case 'unary':
        return -this.evaluate(expr.operand);
      case 'call': {
        const fn = this.functions.get(expr.name);
        if (!fn) throw new Error(`Unknown function '${expr.name}'`);
        return fn(...expr.args.map((arg) => this.evaluate(arg)));
      }
      case 'binary': {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch (expr.op) {
          case '+':
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            if (right === 0) throw new Error('Division by zero');
            return left / right;
        }
      }
    }
  }
}
