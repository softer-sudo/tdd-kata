import { BinaryOp, Expr } from './parser';

export type MathFunction = (...args: number[]) => number;

export interface FunctionLookup {
  get(name: string): MathFunction | undefined;
}

export interface Logger {
  debug(message: string): void;
  warn(message: string): void;
}

function applyBinary(op: BinaryOp, left: number, right: number): number {
  switch (op) {
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
      case 'binary':
        return applyBinary(expr.op, this.evaluate(expr.left), this.evaluate(expr.right));
      case 'call':
        return this.call(expr.name, expr.args);
    }
  }

  private call(name: string, argExprs: Expr[]): number {
    const fn = this.functions.get(name);
    if (!fn) {
      const message = `Unknown function '${name}'`;
      this.logger.warn(message);
      throw new Error(message);
    }
    const args = argExprs.map((arg) => this.evaluate(arg));
    const result = fn(...args);
    this.logger.debug(`${name}(${args.join(', ')}) = ${result}`);
    return result;
  }
}
