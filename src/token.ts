export interface Token {
    type: TokenType;
    literal: string;
}

export enum TokenType {
    ILLEGAL = "ILLEGAL",
    EOF = "EOF",

    PLUS = "PLUS",
    ASSIGN = "ASSIGN",
    MINUS = "MINUS",
    BANG = "BANG",
    ASTERISK = "ASTERISK",
    SLASH = "SLASH",

    LT = "LT",
    GT = "GT",

    EQ = "EQ",
    NEQ = "NEQ",

    IDENT = "IDENT",
    INT = "INT",

    COMMA = "COMMA",
    SEMICOLON = "SEMICOLON",

    LPAREN = "LPAREN",
    RPAREN = "RPAREN",
    LBRACE = "LBRACE",
    RBRACE = "RBRACE",

    FUNCTION = "FUNCTION",
    LET = "LET",
    IF = "IF",
    ELSE = "ELSE",
    RETURN = "RETURN",
    TRUE = "TRUE",
    FALSE = "FALSE",
}