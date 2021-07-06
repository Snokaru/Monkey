import { Token, TokenType } from "./token";
import { 
    LetStatementNode,
    ProgramNode,
    StatementNode,
    ExpressionNode,
    ReturnStatementNode,
    ExpressionStatementNode,
    IdentifierNode,
    IntegerNode,
    PrefixExpressionNode,
    InfixExpressionNode,
    BooleanNode,
    StringNode,
    BlockStatementNode,
    IfExpressionNode,
    FunctionLiteralNode,
    CallExpressionNode,
} from "./ast";

enum Precedence {
    LOWEST = 1,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL
}

export class ParseError extends Error {
    constructor(token: Token, expected: TokenType[ ], tokenIndex: number) {
        super(`PARSER: Failed to parse on token ${tokenIndex}, (expected: ${expected.join(",")}; received: ${token.type})`);
        this.name = "ParserError";
    }
}

export class Parser {
    static readonly PRECEDENCES = {
        [TokenType.EQ]:         Precedence.EQUALS,
        [TokenType.NEQ]:        Precedence.EQUALS,
        [TokenType.LT]:         Precedence.LESSGREATER,
        [TokenType.GT]:         Precedence.LESSGREATER,
        [TokenType.PLUS]:       Precedence.SUM,
        [TokenType.MINUS]:      Precedence.SUM,
        [TokenType.ASTERISK]:   Precedence.PRODUCT,
        [TokenType.SLASH]:      Precedence.PRODUCT,
        [TokenType.LPAREN]:     Precedence.CALL,
    }

    tokens: Token[];
    errors: string[] = [];
    current: number;
    prefixParseFunctions: Map<TokenType, () => ExpressionNode> = new Map<TokenType, () => ExpressionNode>();
    infixParseFunctions: Map<TokenType, (left: ExpressionNode) => ExpressionNode> = new Map<TokenType, (left: ExpressionNode) => ExpressionNode>();

    public constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = -1;

        this.registerPrefix(TokenType.IDENT, (): IdentifierNode => this.parseIdentifier());
        this.registerPrefix(TokenType.INT, (): IntegerNode => this.parseInteger());
        this.registerPrefix(TokenType.STRING, (): StringNode => this.parseString());
        this.registerPrefix(TokenType.BANG, (): PrefixExpressionNode => this.parsePrefixExpression());
        this.registerPrefix(TokenType.MINUS, (): PrefixExpressionNode => this.parsePrefixExpression());
        this.registerPrefix(TokenType.TRUE, (): BooleanNode => this.parseBoolean());
        this.registerPrefix(TokenType.FALSE, (): BooleanNode => this.parseBoolean());
        this.registerPrefix(TokenType.LPAREN, (): ExpressionNode => this.parseGroupExpression());
        this.registerPrefix(TokenType.IF, (): IfExpressionNode => this.parseIfExpression())
        this.registerPrefix(TokenType.FUNCTION, (): FunctionLiteralNode => this.parseFunctionLiteral());

        this.registerInfix(TokenType.MINUS, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.PLUS, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.SLASH, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.ASTERISK, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.EQ, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.NEQ, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.LT, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.GT, (left: ExpressionNode): InfixExpressionNode => this.parseInfixExpression(left));
        this.registerInfix(TokenType.LPAREN, (left: ExpressionNode): CallExpressionNode => this.parseCallExpression(left));
    }

    private peek(): Token {
        return this.tokens[this.current + 1];
    }
    
    private eat(): Token {
        return this.tokens[++this.current];
    }
    
    private peekPrecedence(): Precedence {
        let tokenType = this.tokens[this.current + 1].type as keyof typeof Parser.PRECEDENCES;
        return Parser.PRECEDENCES[tokenType] || Precedence.LOWEST;
    }

    private peekNextPrecedence(): Precedence {
        let tokenType = this.tokens[this.current + 2].type as keyof typeof Parser.PRECEDENCES;
        return Parser.PRECEDENCES[tokenType] || Precedence.LOWEST;
    }

    private registerInfix(type: TokenType, fn: (left: ExpressionNode) => ExpressionNode) {
        this.infixParseFunctions.set(type, fn);
    }

    private registerPrefix(type: TokenType, fn: () => ExpressionNode) {
        this.prefixParseFunctions.set(type, fn);
    }
    
    private expect(expected: TokenType[]): Token {
        if (!expected.includes(this.peek().type))
            throw new ParseError(this.peek(), expected, this.current + 1);
        return this.eat();
    }

    public parse(): ProgramNode {
        return this.parseProgram();
    }

    private parseProgram(): ProgramNode {
        let statements: StatementNode[] = [];
        while (this.peek().type !== TokenType.EOF) {
            let stmt: StatementNode = this.parseStatement();
            statements.push(stmt);
        }
        return new ProgramNode(statements);
    }
    
    private parseStatement(): StatementNode {
        switch (this.peek().type) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseExpressionStatement(): ExpressionStatementNode {
        let expression = this.parseExpression(Precedence.LOWEST);

        if (this.peek().type === TokenType.SEMICOLON)
            this.eat();

        return new ExpressionStatementNode(expression);
    }

    private parseReturnStatement(): ReturnStatementNode {
        this.expect([TokenType.RETURN]);
        let expression = this.parseExpression(Precedence.LOWEST);
        this.expect([TokenType.SEMICOLON]);

        return new ReturnStatementNode(expression);
    }

    private parseLetStatement(): LetStatementNode {
        this.expect([TokenType.LET]);
        let ident = this.expect([TokenType.IDENT]);
        this.expect([TokenType.ASSIGN]);

        let expression = this.parseExpression(Precedence.LOWEST);
        this.expect([TokenType.SEMICOLON])

        return new LetStatementNode(ident.literal, expression);
    }

    private parseExpression(prec: Precedence): ExpressionNode {
        let prefixFunction = this.prefixParseFunctions.get(this.peek().type);
        if (!prefixFunction)
            throw new ParseError(this.peek(), Array.from(this.prefixParseFunctions.keys()), this.current + 1);
       
        let expr = prefixFunction();

        while (this.peek().type !== TokenType.SEMICOLON && prec < this.peekPrecedence()) {
            let infixFunction = this.infixParseFunctions.get(this.peek().type);
            if (!infixFunction) 
                throw new ParseError(this.peek(), Array.from(this.infixParseFunctions.keys()), this.current + 1);
            expr = infixFunction(expr);
        } 
        return expr; 
    }

    private parsePrefixExpression(): PrefixExpressionNode {
        let operator = this.expect([TokenType.MINUS, TokenType.BANG]).type;
        let right = this.parseExpression(Precedence.PREFIX);
        return new PrefixExpressionNode(operator, right);
    }

    private parseInfixExpression(left: ExpressionNode): InfixExpressionNode {
        let precedence: Precedence = this.peekPrecedence();
        let operator = this.eat().type;
        let right = this.parseExpression(precedence);

        return new InfixExpressionNode(left, operator, right);
    }
    
    private parseIdentifier(): IdentifierNode {
        let ident = this.expect([TokenType.IDENT]).literal;
        return new IdentifierNode(ident);
    }
    
    private parseInteger(): IntegerNode {
        let token = this.expect([TokenType.INT]);
        let value = parseInt(token.literal);
        return new IntegerNode(value);
    }

    private parseBoolean(): BooleanNode {
        let token = this.expect([TokenType.TRUE, TokenType.FALSE]);
        let value: boolean = false;

        if (token.type === TokenType.TRUE) {
            value = true;
        } else if (token.type === TokenType.FALSE) {
            value = false;
        } 

        return new BooleanNode(value);
    }

    private parseString(): StringNode {
        let value = this.expect([TokenType.STRING]).literal;
        value = value.slice(1, value.length - 1);
        
        return new StringNode(value);
    }

    private parseGroupExpression(): ExpressionNode {
        this.expect([TokenType.LPAREN]);
        let expr = this.parseExpression(Precedence.LOWEST);
        this.expect([TokenType.RPAREN]);

        return expr;
    }

    private parseBlockStatement(): BlockStatementNode {
        let statements: StatementNode[] = [];
        
        this.expect([TokenType.LBRACE]);

        while (this.peek().type !== TokenType.RBRACE) {
            let nextStatement = this.parseStatement();
            statements.push(nextStatement);
        }
        this.eat();

        return new BlockStatementNode(statements);
    }

    private parseIfExpression(): IfExpressionNode  {

        this.expect([TokenType.IF]);
        
        let condition = this.parseExpression(Precedence.LOWEST);
        let consequence = this.parseBlockStatement();
        let alternative = null;

        if (this.peek().type === TokenType.ELSE) {
            this.eat();
            alternative = this.parseBlockStatement();
        }
        
        return new IfExpressionNode(condition, consequence, alternative);
    }

    private parseFunctionLiteral(): FunctionLiteralNode {
        this.expect([TokenType.FUNCTION]);

        let parameters = this.parseFunctionParameters();
        let body = this.parseBlockStatement();
        return new FunctionLiteralNode(parameters, body);
    }
    
    private parseFunctionParameters(): IdentifierNode[] {
        let identifiers: IdentifierNode[] = [];
        this.expect([TokenType.LPAREN]);
        
        if (this.peek().type === TokenType.IDENT) {
            identifiers.push(this.parseIdentifier());
        }

        while (this.peek().type === TokenType.COMMA) {
            this.eat();
            identifiers.push(this.parseIdentifier());
        }

        this.expect([TokenType.RPAREN]);
        return identifiers; 
    }

    private parseCallExpression(left: ExpressionNode): CallExpressionNode {
        let fn = left;
        let args: ExpressionNode[] = [];

        this.expect([TokenType.LPAREN]);

        if (this.peek().type === TokenType.RPAREN) {
            this.eat();
            return new CallExpressionNode(fn, args);
        }

        let newArg = this.parseExpression(Precedence.LOWEST);
        args.push(newArg);

        while (this.peek().type === TokenType.COMMA) {
            this.eat();
            args.push(this.parseExpression(Precedence.LOWEST));
        }

        this.expect([TokenType.RPAREN]);

        return new CallExpressionNode(fn, args);
    }
    
}
