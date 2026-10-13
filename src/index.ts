import { Evaluator } from './evaluator';
import { Expr, parse } from './parser';
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

// Compile-only stub: real tokenizer and parser, but an evaluator that always answers 0.
export function createCalculator(): Calculator {
  return new Calculator({ tokenize, parse, evaluator: { evaluate: () => 0 } });
}
