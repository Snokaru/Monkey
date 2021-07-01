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
    rl.prompt();
    for await (const line of rl) {
        try {
            const lexer: Lexer = new Lexer(line);
            const tokens: Token[] = lexer.getTokens()
            const parser: Parser = new Parser(tokens);
            const program: ProgramNode = parser.parse();
            console.log(program.accept(interpreter).value);
        } catch (error) {
            console.log(error.message);
            rl.prompt();
            continue;
        }
        rl.prompt();
    }
}
