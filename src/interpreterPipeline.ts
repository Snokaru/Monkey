import readline = require("readline");
import { Token } from "./token";
import { Lexer } from "./lexer";
import { Parser  } from "./parser";
import { ProgramNode } from "./ast";
import { Interpreter } from "./interpreter";
import { stat } from "fs";

const PROMPT = "> ";

export async function run(fileContent: string): Promise<void> {
    try {
        const lexer: Lexer = new Lexer(fileContent);
        const tokens: Token[] = lexer.getTokens()
        const parser: Parser = new Parser(tokens);
        const program: ProgramNode = parser.parse();
        const interpreter: Interpreter = new Interpreter(); 
        program.accept(interpreter);
    } catch (error) {
        console.log(error.message);
    }
}
