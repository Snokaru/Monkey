import { 
    ExpressionStatementNode,
    LetStatementNode,
    ProgramNode,
    ReturnStatementNode,
    Visitor, 
    IdentifierNode,
    IntegerNode,
    PrefixExpressionNode,
    InfixExpressionNode,
    BooleanNode,
    IfExpressionNode,
    BlockStatementNode,
    FunctionLiteralNode,
    CallExpressionNode,
} from "./ast";

const indent = (_target: AstPrinter, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: unknown[]) {
        const self = this as AstPrinter;
        self.indent += 2;
        self.spacing = " ".repeat(self.indent);
        let result = originalMethod.apply(this, args);
        self.indent -= 2;
        return result;
    }
}
export class AstPrinter extends Visitor<string> {
    indent: number = -2;
    spacing: string = "";

    @indent
    public visitLetStatementNode(node: LetStatementNode): string {
        let result: string = `${this.spacing}LetStatementNode\n${this.spacing + "  "}Identifier ${node.identifier}\n${node.expression.accept(this)}`  
        return result;
    }

    @indent
    public visitReturnStatementNode(node: ReturnStatementNode): string {
        let result: string = `${this.spacing}ReturnStatementNode\n${node.expression.accept(this)}`; 
        return result;
    }

    @indent
    public visitExpressionStatementNode(node: ExpressionStatementNode): string {
        let result: string = `${this.spacing}ExpressionStatementNode\n${node.expression.accept(this)}`;
        return result;
    }

    @indent
    public visitProgramNode(node: ProgramNode): string {
        let result: string = `${this.spacing}ProgramNode\n${node.statements.map(statement => statement.accept(this)).join("\n")}`;
        return result;
    }

    @indent
    public visitIfExpressionNode(node: IfExpressionNode): string {
        let result: string = `${this.spacing}IfExpressionNode\n${node.condition.accept(this)}\n${node.consequence.accept(this)}`
        if (node.alternative)
            result += node.alternative.accept(this);
        return result;
    }

    @indent
    public visitBlockStatementNode(node: BlockStatementNode): string {
        let result: string = `${this.spacing}BlockStatementNode\n${node.statements.map(statement => statement.accept(this)).join("\n")}`
        return result;
    }

    @indent
    public visitIdentifierNode(node: IdentifierNode): string {
        let result: string = `${this.spacing}IdentifierNode\n${this.spacing + "  "}Identifier ${node.identifier}`;
        return result;
    }

    @indent
    public visitIntegerNode(node: IntegerNode): string {
        let result: string = `${this.spacing}IntegerNode\n${this.spacing + "  "}Value ${node.value}`;
        return result;
    }

    @indent
    public visitPrefixExpressionNode(node: PrefixExpressionNode): string {
        let result: string = `${this.spacing}PrefixExpressionNode\n${this.spacing + "  "}Operator ${node.operator}\n${node.right.accept(this)}`;
        return result;
    }

    @indent
    public visitInfixExpressionNode(node: InfixExpressionNode): string {
        let result: string = `${this.spacing}InfixExpressionNode\n${node.left.accept(this)}\n${this.spacing}Operator ${node.operator}\n${node.right.accept(this)}`;
        return result;
    }

    @indent
    public visitBooleanNode(node: BooleanNode): string {
        let result: string = `${this.spacing}BooleanNode\n${this.spacing + "  "}Value ${node.value}`;
        return result;
    }
    
    @indent
    public visitFunctionLiteralNode(node: FunctionLiteralNode): string {
        let result: string = `${this.spacing}FunctionLiteralNode\n${this.spacing + "  "}Parameters ${node.parameters.map(p => p.identifier).join(", ")}\n`;
        result += node.body.accept(this);
        return result;
    }

    @indent
    public visitCallExpressionNode(node: CallExpressionNode): string {
        let result: string = `${this.spacing}CallExpressionNode\n${node.fn.accept(this)}\n${node.args.map(arg => arg.accept(this)).join("\n")}`;
        return result;
    }
}
