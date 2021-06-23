export abstract class Node {
    public abstract accept<T>(visitor: Visitor<T>): T;
}

export abstract class Visitor<T> {
    public abstract visitLetStatementNode(node: LetStatementNode): T;
    public abstract visitReturnStatementNode(node: ReturnStatementNode): T;
    public abstract visitExpressionStatementNode(node: ExpressionStatementNode): T;
    public abstract visitProgramNode(node: ProgramNode): T;
    public abstract visitIdentifierNode(node: IdentifierNode): T;
    public abstract visitIntegerNode(node: IntegerNode): T;
    public abstract visitPrefixExpressionNode(node: PrefixExpressionNode): T;
    public abstract visitInfixExpressionNode(node: InfixExpressionNode): T;
    public abstract visitBooleanNode(node: BooleanNode): T;
    public abstract visitBlockStatementNode(node: BlockStatementNode): T;
    public abstract visitIfExpressionNode(node: IfExpressionNode): T;
    public abstract visitFunctionLiteralNode(node: FunctionLiteralNode): T;
    public abstract visitCallExpressionNode(node: CallExpressionNode): T;
}

export class ProgramNode implements Node {
    public constructor(
        public statements: StatementNode[]
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitProgramNode(this);
    }
}

export abstract class StatementNode extends Node {
}

export class ExpressionStatementNode implements StatementNode {
    public constructor(
        public expression: ExpressionNode
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpressionStatementNode(this);
    }
}
export class LetStatementNode implements StatementNode {
    public constructor(
        public identifier: string,
        public expression: ExpressionNode,
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLetStatementNode(this);
    }
}

export class ReturnStatementNode implements StatementNode {
    public constructor(
        public expression: ExpressionNode,
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitReturnStatementNode(this);
    }
}

export abstract class ExpressionNode extends Node {
}

export class FunctionLiteralNode implements ExpressionNode {
    public constructor(
        public parameters: IdentifierNode[] = [],
        public body: BlockStatementNode,
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitFunctionLiteralNode(this);
    }
}

export class BooleanNode implements ExpressionNode {
    public constructor(
        public value: boolean,
    ) {}
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBooleanNode(this);
    }
}

export class IdentifierNode implements ExpressionNode {
    public constructor(
        public identifier: string,
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIdentifierNode(this);
    }
}

export class IntegerNode implements ExpressionNode {
    public constructor(
        public value: number,
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIntegerNode(this);
    }
}

export class PrefixExpressionNode implements ExpressionNode {
    public constructor(
        public operator: string,
        public right: ExpressionNode,
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitPrefixExpressionNode(this);
    }
}

export class InfixExpressionNode implements ExpressionNode {
    public constructor(
        public left: ExpressionNode,
        public operator: string,
        public right: ExpressionNode,
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitInfixExpressionNode(this);
    }
}

export class IfExpressionNode implements ExpressionNode {
    public constructor(
        public condition: ExpressionNode,
        public consequence: BlockStatementNode,
        public alternative: BlockStatementNode | null,
    ) {}
    
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIfExpressionNode(this);
    }
}

export class BlockStatementNode implements Node {
    public constructor(
        public statements: StatementNode[],
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBlockStatementNode(this);
    }
}

export class CallExpressionNode implements ExpressionNode {
    public constructor(
        public fn: ExpressionNode,
        public args: ExpressionNode[],
    ) {}

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitCallExpressionNode(this);
    }
}