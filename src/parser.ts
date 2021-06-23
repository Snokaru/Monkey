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


export class Parser {
    static precedences = {
        [TokenType.EQ]:     Precedence.EQUALS,
        [TokenType.NEQ]:    Precedence.EQUALS,
        [TokenType.LT]:     Precedence.LESSGREATER,
        [TokenType.GT]:     Precedence.LESSGREATER,
        [TokenType.PLUS]:   Precedence.SUM,
        [TokenType.MINUS]: Precedence.SUM,
        [TokenType.ASTERISK]: Precedence.PRODUCT,
        [TokenType.SLASH]: Precedence.PRODUCT,
        [TokenType.LPAREN]: Precedence.CALL,
    }
    tokens: Token[];
    errors: string[] = [];
    current: number;
    prefixParseFunctions: Map<TokenType, () => ExpressionNode> = new Map<TokenType, () => ExpressionNode>();
    infixParseFunctions: Map<TokenType, () => ExpressionNode> = new Map<TokenType, () => ExpressionNode>();

    public constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = -1;

        this.registerPrefix(TokenType.IDENT, (): IdentifierNode => this.parseIdentifier());
        this.registerPrefix(TokenType.INT, (): IntegerNode => this.parseInteger());
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
        return Parser.precedences[this.tokens[this.current + 1].type] || Precedence.LOWEST;
    }

    private peekNextPrecedence(): Precedence {
        return Parser.precedences[this.tokens[this.current + 2].type];
    }

    private registerInfix(type: TokenType, fn: (left: ExpressionNode) => ExpressionNode) {
        this.infixParseFunctions[type] = fn;
    }

    private registerPrefix(type: TokenType, fn: () => ExpressionNode) {
        this.prefixParseFunctions[type] = fn;
    }
    
    private expect(tokenTypes: TokenType[]): boolean {
        return tokenTypes.includes(this.peek().type);
    }

    public parse(): ProgramNode {
        return this.parseProgram();
    }

    private parseProgram(): ProgramNode {
        let program: ProgramNode = new ProgramNode();
        while (this.peek().type !== TokenType.EOF) {
            let stmt: StatementNode = this.parseStatement();
            if (!stmt) {
                throw new Error("Parse error!");
            }
            program.statements.push(stmt);
        }
        return program;
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
        let stmt = new ExpressionStatementNode();
        stmt.expression = this.parseExpression(Precedence.LOWEST);

        if (this.peek().type === TokenType.SEMICOLON)
            this.eat();

        return stmt;
    }

    private parseReturnStatement(): ReturnStatementNode {
        let stmt = new ReturnStatementNode();

        if (!this.expect([TokenType.RETURN]))
            return null;
        this.eat();

        stmt.expression = this.parseExpression(Precedence.LOWEST);

        if (!this.expect([TokenType.SEMICOLON]))
            return null;
        this.eat();
        
        return stmt;
    }

    private parseLetStatement(): LetStatementNode {
        let stmt: LetStatementNode = new LetStatementNode();
        
        if (!this.expect([TokenType.LET]))
            return null;
        this.eat();

        if (!this.expect([TokenType.IDENT]))
            return null;
        const token: Token = this.eat(); 
        stmt.identifier = token.literal;

        if (!this.expect([TokenType.ASSIGN]))
            return null;
        this.eat();
        
        stmt.expression = this.parseExpression(Precedence.LOWEST);

        if (!this.expect([TokenType.SEMICOLON]))
            return null;
        this.eat();

        return stmt;
    }

    private parseExpression(prec: Precedence): ExpressionNode {
        let prefixFunction: () => ExpressionNode = this.prefixParseFunctions[this.peek().type];
        console.log(this.peek().type);
        console.log(prefixFunction);
        if (!prefixFunction) {
            return null;
        }
        let expr = prefixFunction();

        while (this.peek().type !== TokenType.SEMICOLON && prec < this.peekPrecedence()) {
            let infixFunction: (left: ExpressionNode) => ExpressionNode = this.infixParseFunctions[this.peek().type];
            if (!infixFunction) {
                return null;
            }
            expr = infixFunction(expr);
        } 
        return expr; 
    }

    private parsePrefixExpression(): PrefixExpressionNode {
        let expr: PrefixExpressionNode = new PrefixExpressionNode();
        
        if (!this.expect([TokenType.MINUS, TokenType.BANG])) {
            return null;
        }
        expr.operator = this.eat().literal;
        expr.right = this.parseExpression(Precedence.PREFIX);
        return expr;
    }

    private parseInfixExpression(left: ExpressionNode): InfixExpressionNode {
        let expression: InfixExpressionNode = new InfixExpressionNode();
        expression.left = left;

        let precedence: Precedence = this.peekPrecedence();
        expression.operator = this.eat().literal;


        expression.right = this.parseExpression(precedence);

        return expression;

    }
    
    private parseIdentifier(): IdentifierNode {
        let ident: IdentifierNode = new IdentifierNode();
        ident.identifier = this.eat().literal;
        return ident;
    }
    
    private parseInteger(): IntegerNode {
        let integer: IntegerNode = new IntegerNode;
        integer.value = parseInt(this.eat().literal);
        return integer;
    }

    private parseBoolean(): BooleanNode {
        let bool = new BooleanNode();
        let type: TokenType = this.eat().type;

        if (type === TokenType.TRUE) {
            bool.value = true;
        }
        else {
            bool.value = false;
        }

        return bool;
    }

    private parseGroupExpression(): ExpressionNode {
        this.eat();

        let expr = this.parseExpression(Precedence.LOWEST);

        if (!this.expect([TokenType.RPAREN])) {
            return null;
        }

        this.eat();
        return expr;
    }

    private parseBlockStatement(): BlockStatementNode {
        let blockStmt = new BlockStatementNode();
        
        if (!this.expect([TokenType.LBRACE]))
            return null;

        this.eat();

        while (!this.expect([TokenType.RBRACE])) {
            blockStmt.statements.push(this.parseStatement());
        }
        this.eat();

        return blockStmt;
    }

    private parseIfExpression(): IfExpressionNode {
        let ifExpr = new IfExpressionNode();

        if (!this.expect([TokenType.IF]))
            return null;
        this.eat();
        
        ifExpr.condition = this.parseExpression(Precedence.LOWEST);
        ifExpr.consequence = this.parseBlockStatement();

        if (!this.expect([TokenType.ELSE])) {
            ifExpr.alternative = null;
            return ifExpr;
        }
        this.eat();
        
        ifExpr.alternative = this.parseBlockStatement();
        
        return ifExpr;
    }

    private parseFunctionLiteral(): FunctionLiteralNode {
        let functionLiteral = new FunctionLiteralNode();
        if (!this.expect([TokenType.FUNCTION]))
            return null;
        this.eat();

        functionLiteral.parameters = this.parseFunctionParameters();
        functionLiteral.body = this.parseBlockStatement();
        return functionLiteral;
    }
    
    private parseFunctionParameters(): IdentifierNode[] {
        let identifiers: IdentifierNode[] = [];
        if (this.peek().type !== TokenType.LPAREN) {
            return null;
        }
        this.eat();
        
        if (this.peek().type === TokenType.IDENT) {
            let ident: IdentifierNode = this.parseIdentifier();
            identifiers.push(ident);
        }

        while (this.peek().type === TokenType.COMMA) {
            this.eat();

            if (!this.expect([TokenType.IDENT])) {
                return null;
            }

            let ident: IdentifierNode = this.parseIdentifier();
            identifiers.push(ident);
        }

        if (this.peek().type !== TokenType.RPAREN)
            return null;
        this.eat();
        
        return identifiers; 
    }

    private parseCallExpression(left: ExpressionNode): CallExpressionNode {
        let callExpr = new CallExpressionNode();
        callExpr.function = left;

        if (!this.expect([TokenType.LPAREN])) {
            return null;
        }
        this.eat();

        if (this.peek().type === TokenType.RPAREN) {
            this.eat();
            callExpr.arguments = null;
            return callExpr;
        }

        callExpr.arguments.push(this.parseExpression(Precedence.LOWEST)); 

        while (this.expect([TokenType.COMMA])) {
            this.eat();
            callExpr.arguments.push(this.parseExpression(Precedence.LOWEST));
        }

        if (!this.expect([TokenType.RPAREN])) {
            return null;
        }
        this.eat();

        return callExpr;
    }

}
