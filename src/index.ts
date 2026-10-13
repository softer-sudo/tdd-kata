import { Evaluator, FunctionLookup, Logger } from './evaluator';
import { Expr, parse } from './parser';
import { createDefaultRegistry, FunctionRegistry } from './registry';
import { Token, tokenize } from './tokenizer';

/** The pipeline stages, injected so each can be replaced by a test double. */
export interface CalculatorDeps {
  tokenize: (input: string) => Token[];
  parse: (tokens: Token[]) => Expr;
  evaluator: Pick<Evaluator, 'evaluate'>;
}

export class Calculator {
  constructor(private readonly deps: CalculatorDeps) {}

  calculate(input: string): number {
    const { tokenize, parse, evaluator } = this.deps;
    return evaluator.evaluate(parse(tokenize(input)));
  }
}

export interface CalculatorOptions {
  registry?: FunctionLookup;
  logger?: Logger;
}

const silentLogger: Logger = { debug: () => {}, warn: () => {} };

/** Composition root: the only place where the real parts are wired together. */
export function createCalculator(options: CalculatorOptions = {}): Calculator {
  const { registry = createDefaultRegistry(), logger = silentLogger } = options;
  const evaluator = new Evaluator(registry, logger);
  return new Calculator({ tokenize, parse, evaluator });
}

export { Evaluator, FunctionRegistry, createDefaultRegistry, parse, tokenize };
export type { FunctionLookup, Logger, MathFunction } from './evaluator';
export type { BinaryOp, Expr } from './parser';
export type { Token, TokenType } from './tokenizer';
