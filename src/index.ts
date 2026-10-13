import { Evaluator, Logger } from './evaluator';
import { Expr, parse } from './parser';
import { createDefaultRegistry } from './registry';
import { Token, tokenize } from './tokenizer';

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

const silentLogger: Logger = { debug: () => {}, warn: () => {} };

export function createCalculator(): Calculator {
  const evaluator = new Evaluator(createDefaultRegistry(), silentLogger);
  return new Calculator({ tokenize, parse, evaluator });
}
