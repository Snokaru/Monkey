import { 
    ExpressionStatementNode,
    ExpressionNode,
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
    CallExpressionNode
} from "./ast";

export class AstPrinter extends Visitor<string> {
    indent: number = -2;

    public visitLetStatementNode(node: LetStatementNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}LetStatementNode\n${spacing + "  "}Identifier ${node.identifier}\n${node.expression.accept(this)}`  
        this.indent -= 2;

        return result;
    }

    public visitReturnStatementNode(node: ReturnStatementNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}ReturnStatementNode\n${node.expression.accept(this)}`; 
        this.indent -= 2;

        return result;
    }

    public visitExpressionStatementNode(node: ExpressionStatementNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}ExpressionStatementNode\n${node.expression.accept(this)}`;
        this.indent -= 2;

        return result;
    }

    public visitExpressionNode(node: ExpressionNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}ExpressionNode`;
        this.indent -= 2;
        return result;
    }

    public visitProgramNode(node: ProgramNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}ProgramNode\n${node.statements.map(statement => statement.accept(this)).join("\n")}`
        this.indent -= 2;
        return result;
    }


    public visitIfExpressionNode(node: IfExpressionNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}IfExpressionNode\n${node.condition.accept(this)}\n${node.consequence.accept(this)}`
        if (node.alternative)
            result += node.alternative.accept(this);
        this.indent -= 2;

        return result;
    }

    public visitBlockStatementNode(node: BlockStatementNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}BlockStatementNode\n${node.statements.map(statement => statement.accept(this)).join("\n")}`
        this.indent -= 2;

        return result;
    }

    public visitIdentifierNode(node: IdentifierNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}IdentifierNode\n${spacing + "  "}Identifier ${node.identifier}`;
        this. indent -= 2;

        return result;
    }

    public visitIntegerNode(node: IntegerNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}IntegerNode\n${spacing + "  "}Value ${node.value}`;
        this.indent -= 2;

        return result;
    }

    public visitPrefixExpressionNode(node: PrefixExpressionNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}PrefixExpressionNode\n${spacing + "  "}Operator ${node.operator}\n${node.right.accept(this)}`;
        this.indent -= 2;
        
        return result;
    }

    public visitInfixExpressionNode(node: InfixExpressionNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}InfixExpressionNode\n${node.left.accept(this)}\n${spacing + "  "}Operator ${node.operator}\n${node.right.accept(this)}`;
        this.indent -= 2;
        return result;
    }

    public visitBooleanNode(node: BooleanNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}BooleanNode\n${spacing + "  "}Value ${node.value}`;
        this.indent -= 2;
        return result;
    }
    
    public visitFunctionLiteralNode(node: FunctionLiteralNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}FunctionLiteralNode\n${spacing + "  "}Parameters ${node.parameters.map(p => p.identifier).join(", ")}\n`
        result += node.body.accept(this);
        this.indent -= 2;
        return result;
    }

    public visitCallExpressionNode(node: CallExpressionNode): string {
        this.indent += 2;
        let spacing: string = " ".repeat(this.indent);
        let result: string = `${spacing}CallExpressionNode\n${node.function.accept(this)}\n${node.arguments.map(arg => arg.accept(this)).join("\n")}`;
        this.indent -= 2;
        return result;
    }
}
