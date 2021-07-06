import { 
    BlockStatementNode,
    BooleanNode,
    CallExpressionNode,
    ExpressionStatementNode,
    FunctionLiteralNode,
    IdentifierNode,
    IfExpressionNode,
    InfixExpressionNode,
    IntegerNode,
    LetStatementNode,
    PrefixExpressionNode,
    ProgramNode,
    ReturnStatementNode,
    StringNode,
    Visitor,
} from "./ast";
import { 
    BaseMonkeyObject,
    BooleanObject,
    FunctionObject,
    IntegerObject,
    StringObject,
    NullObject,
} from "./interpreterTypes";
import { findPrefixOperation, findInfixOperation  } from "./interpreterFunctions";
import { InterpreterStack } from "./interpreterStack";

export class InterpretError extends Error {
    constructor(message: string) {
        super(`INTERPRET: ${message}`);
        this.name = "InterpretError";
    }
}

export class Interpreter extends Visitor<BaseMonkeyObject> {
    private environment: InterpreterStack = new InterpreterStack();

    constructor() {
        super();
    }
    
    public get env() {
        return this.environment;
    }

    public visitLetStatementNode(node: LetStatementNode): BaseMonkeyObject {
        if (this.environment.has(node.identifier))
            throw new InterpretError(`Identifier ${node.identifier} is already defined in this scope`);

        let value = node.expression.accept(this);
        this.environment.create(node.identifier, value);
        
        return value;
    }

    public visitReturnStatementNode(node: ReturnStatementNode): BaseMonkeyObject {
        let returnObj = node.expression.accept(this);
        returnObj.isReturn = true;
        return returnObj;
    }

    public visitExpressionStatementNode(node: ExpressionStatementNode): BaseMonkeyObject {
        return node.expression.accept(this);
    }

    public visitProgramNode(node: ProgramNode): BaseMonkeyObject {
        this.environment.newScope(); 

        let result: BaseMonkeyObject = new NullObject(); 
        for (const statement of node.statements) {
            result = statement.accept(this);
            if (result.isReturn)
                return result;
        }
        
        this.environment.removeScope();
        return result;
    }

    public visitIdentifierNode(node: IdentifierNode): BaseMonkeyObject {
        const identifierObject = this.environment.get(node.identifier);

        if (!identifierObject)
            throw new InterpretError(`Identifier ${node.identifier} is not defined`);

        return identifierObject;
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

    public visitStringNode(node: StringNode): StringObject {
        return new StringObject(node.value);
    }

    public visitBlockStatementNode(node: BlockStatementNode): BaseMonkeyObject {
        this.environment.newScope();
        let result: BaseMonkeyObject = new NullObject();

        for (const statement of node.statements) {
            result = statement.accept(this);
            if (result.isReturn) 
                return result;
        }
        
        this.environment.removeScope();
        return result;
    }

    public visitIfExpressionNode(node: IfExpressionNode): BaseMonkeyObject {
        const conditionObject = node.condition.accept(this);

        if (conditionObject.value === true)
            return node.consequence.accept(this);
        else if (node.alternative)  
            return node.alternative.accept(this);
        
        return new NullObject();

    }

    public visitFunctionLiteralNode(node: FunctionLiteralNode): BaseMonkeyObject {
        return new FunctionObject(node.parameters.map(p => p.identifier), this.environment.copy(), node.body);
    }

    public visitCallExpressionNode(node: CallExpressionNode): BaseMonkeyObject {
        const functionObj = node.fn.accept(this);
        
        if (!(functionObj instanceof FunctionObject))
            throw new InterpretError(`${functionObj.constructor.name} is not a function object`);
        
        this.environment.newScope();
        this.environment.extend(functionObj.environment);
        for (let i = 0; i < functionObj.args.length; i++) {
            this.environment.create(functionObj.args[i], node.args[i].accept(this));
        }
        let returnValue = functionObj.body.accept(this);
        this.environment.removeScope();
        
        return returnValue;
    }
}
