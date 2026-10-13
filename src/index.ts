import { Evaluator } from './evaluator';
import { Expr } from './parser';
import { Token } from './tokenizer';

export interface CalculatorDeps {
  tokenize: (input: string) => Token[];
  parse: (tokens: Token[]) => Expr;
  evaluator: Pick<Evaluator, 'evaluate'>;
}

// Compile-only stub: gives the first calculator test something to fail against.
export class Calculator {
  constructor(private readonly deps: CalculatorDeps) {}

  calculate(_input: string): number {
    return 0;
  }
}
