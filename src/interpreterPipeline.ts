import readline = require("readline");
import { Token } from "./token";
import { Lexer } from "./lexer";
import { Parser  } from "./parser";
import { ProgramNode } from "./ast";
import { Interpreter } from "./interpreter";
import { stat } from "fs";
import { BaseMonkeyObject } from "./interpreterTypes";

const PROMPT = "> ";

export function run(fileContent: string): BaseMonkeyObject | null {
    try {
        const lexer: Lexer = new Lexer(fileContent);
        const tokens: Token[] = lexer.getTokens()
        const parser: Parser = new Parser(tokens);
        const program: ProgramNode = parser.parse();
        const interpreter: Interpreter = new Interpreter(); 
        return program.accept(interpreter);
    } catch (error) {
        console.log(error.message);
        return null;
    }
}
