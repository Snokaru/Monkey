import { BlockStatementNode, BooleanNode, CallExpressionNode, ExpressionStatementNode, FunctionLiteralNode, IdentifierNode, IfExpressionNode, InfixExpressionNode, IntegerNode, LetStatementNode, PrefixExpressionNode, ProgramNode, ReturnStatementNode, Visitor } from "./ast";
import { BaseMonkeyObject, BooleanObject, IntegerObject } from "./interpreterTypes";
import { findPrefixOperation, findInfixOperation  } from "./interpreterFunctions";


export class InterpretError extends Error {
    constructor(message: string) {
        super(`INTERPRET: ${message}`);
        this.name = "InterpretError";
    }
}

export class Interpreter extends Visitor<BaseMonkeyObject> {

    constructor() {
        super();
    }

    public visitLetStatementNode(node: LetStatementNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
    public visitReturnStatementNode(node: ReturnStatementNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
    public visitExpressionStatementNode(node: ExpressionStatementNode): BaseMonkeyObject {
        return node.expression.accept(this);
    }
    public visitProgramNode(node: ProgramNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
    public visitIdentifierNode(node: IdentifierNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
    public visitIntegerNode(node: IntegerNode): IntegerObject {
        return new IntegerObject(node.value);
    }
    public visitPrefixExpressionNode(node: PrefixExpressionNode): BaseMonkeyObject {
        const rightValue = node.right.accept(this);
        const operationFn  = findPrefixOperation(node.operator, rightValue);
        
        if (!operationFn)
            throw new InterpretError(`Operation ${node.operator} could not be applied to argument of type ${rightValue.constructor.name}`);
        
        return operationFn(rightValue);
        
        
    }
    public visitInfixExpressionNode(node: InfixExpressionNode): BaseMonkeyObject {
        const leftObject = node.left.accept(this); 
        const rightObject = node.right.accept(this);
        const operationFn = findInfixOperation(node.operator, leftObject, rightObject);
        
        if (!operationFn)
            throw new InterpretError(`Operation ${node.operator} could not be applied to arguments of types ${leftObject.constructor.name}, ${rightObject.constructor.name}`);

        return operationFn(leftObject, rightObject);
    }
    public visitBooleanNode(node: BooleanNode): BooleanObject {
        return new BooleanObject(node.value);
    }
    public visitBlockStatementNode(node: BlockStatementNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
    public visitIfExpressionNode(node: IfExpressionNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
    public visitFunctionLiteralNode(node: FunctionLiteralNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
    public visitCallExpressionNode(node: CallExpressionNode): BaseMonkeyObject {
        throw new Error("Method not implemented.");
    }
     
}
