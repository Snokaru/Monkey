import readline = require("readline");
import { Token } from "./token";
import { Lexer } from "./lexer";
import { Parser  } from "./parser";
import { ProgramNode } from "./ast";
import { AstPrinter } from "./astPrinter";

const PROMPT = "> ";

export async function run(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT,
    });
    rl.prompt();
    for await (const line of rl) {
        const lexer: Lexer = new Lexer(line);
        const tokens: Token[] = lexer.getTokens()
        const parser: Parser = new Parser(tokens);
       // try {
            const program: ProgramNode = parser.parse();
            const printer: AstPrinter = new AstPrinter();
            console.log(program.accept(printer));
        /*
        } catch (error) {
            console.log("Failed to parse the given tokens.");
            console.log(error.message);
        }
        */

        rl.prompt();
    }
}
