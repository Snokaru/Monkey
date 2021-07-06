import readline = require("readline");
import { Token } from "./token";
import { Lexer } from "./lexer";
import { Parser  } from "./parser";
import { ProgramNode } from "./ast";
import { Interpreter } from "./interpreter";

const PROMPT = "> ";

export async function run(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT,
    });
    const interpreter: Interpreter = new Interpreter(); 
    interpreter.env.newScope();
    rl.prompt();
    for await (const line of rl) {
        try {
            const lexer: Lexer = new Lexer(line);
            const tokens: Token[] = lexer.getTokens()
            const parser: Parser = new Parser(tokens);
            const program: ProgramNode = parser.parse();
            for(const statement of program.statements) {
                const statementResult = statement.accept(interpreter).value;
                statementResult && console.log(statementResult);
            }
        } catch (error) {
            console.log(error.message);
            rl.prompt();
            continue;
        }
        rl.prompt();
    }
    interpreter.env.removeScope();
}
