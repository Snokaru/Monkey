import { Token, TokenType } from "./token";

function isLetter(character: string): boolean {
    return (/[a-zA-Z]/).test(character);
}

function isDigit(character: string): boolean {
    return (/[0-9]/).test(character);
}

function isAlphaNumeric(character: string): boolean {
    return (/[a-zA-Z0-9]/).test(character);
}

export class Lexer {
    private static readonly KEYWORDS: Record<string, TokenType | undefined> = {
        "fn": TokenType.FUNCTION,
        "let": TokenType.LET,
        "return": TokenType.RETURN,
        "if": TokenType.IF,
        "else": TokenType.ELSE,
        "true": TokenType.TRUE,
        "false": TokenType.FALSE
    };
    private input: string;
    private position: number;

    public constructor(input: string) {
        this.input = input;
        this.position = -1;
    }

    public lookupIdentifier(literal: string): TokenType {
        return Lexer.KEYWORDS[literal] || TokenType.IDENT;
    }

    private eat(): string {
        if (this.position + 1 === this.input.length)
            return "";
        return this.input[++this.position];
    }

    private peek(): string {
        if (this.position + 1 === this.input.length)
            return "";
        return this.input[this.position + 1];
    }

    private readLiteral(): string {
        const initialCharacterPosition: number = this.position;
        while (isAlphaNumeric(this.peek())) {
            this.eat();
        }
        return this.input.slice(initialCharacterPosition, this.position + 1);
    }

    private skipWhitespace(): void {
        let nextChar: string = this.peek();
        while(nextChar == " " || nextChar == "\n" || nextChar == "\t" || nextChar == "\r") {
            this.eat();
            nextChar = this.peek();
        }
    }

    private readNumber(): string {
        const startingPosition: number = this.position;
        while (isDigit(this.peek())) {
            this.eat();
        } 
        return this.input.slice(startingPosition, this.position + 1);
    }

    private getNextToken(): Token {
        this.skipWhitespace();
        const currentCharacter: string = this.eat();
        //console.log("CURRENT CHARACTER IS: ", currentCharacter, " AT POS: ", this.position);

        let token: Token;
        switch (currentCharacter) {
            case "=":
                if (this.peek() == "=") {
                    this.eat();
                    token = { type: TokenType.EQ, literal: "==" };
                    break;
                }
                token = { type: TokenType.ASSIGN, literal: "=" };
                break;
            case "+":
                token = { type: TokenType.PLUS, literal: "+" };
                break;
            case "-":
                token = { type: TokenType.MINUS, literal: "-" };
                break;
            case "!":
                if (this.peek() == "=") {
                    this.eat();
                    token = { type: TokenType.NEQ, literal: "!=" };
                    break;
                }
                token = { type: TokenType.BANG, literal: "!" };
                break;
            case "*":
                token = { type: TokenType.ASTERISK, literal: "*" };
                break;
            case "/":
                token = { type: TokenType.SLASH, literal: "/" };
                break;
            case "(":
                token = { type: TokenType.LPAREN, literal: "(" };
                break;
            case "<":
                token = { type: TokenType.LT, literal: "<" };
                break;
            case ">":
                token = { type: TokenType.GT, literal: ">" };
                break;
            case ")":
                token = { type: TokenType.RPAREN, literal: ")" };
                break;
            case "{":
                token = { type: TokenType.LBRACE, literal: "{" };
                break;
            case "}":
                token = { type: TokenType.RBRACE, literal: "}" };
                break;
            case ";":
                token = { type: TokenType.SEMICOLON, literal: ";" };
                break;
            case ",":
                token = { type: TokenType.COMMA, literal: "," };
                break;
            case "":
                token = { type: TokenType.EOF, literal: "" };
                break;
            default:
                if (isLetter(currentCharacter)) {
                    const literal: string = this.readLiteral();
                    const tokenType: TokenType = this.lookupIdentifier(literal);
                    token = { type: tokenType, literal };
                } else if (isDigit(currentCharacter)) {
                    const tokenType: TokenType = TokenType.INT;
                    const literal = this.readNumber();
                    token = { type: tokenType, literal };
                } else {
                    token = { type: TokenType.ILLEGAL, literal: currentCharacter }
                }

        }
        return token;
    }

    public getTokens(): Token[] {
        const tokens: Token[] = [];
        let token: Token;
        do {
            token = this.getNextToken();
            tokens.push(token);
        } while(token.type !== TokenType.EOF);
        return tokens;
    } 
}
