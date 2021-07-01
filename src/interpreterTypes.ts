import { BlockStatementNode, IdentifierNode } from "./ast";
import { InterpreterStack } from "./interpreterStack";

export abstract class BaseMonkeyObject {
    public value: number | boolean | null;
    public isReturn: boolean;
}

export class IntegerObject implements BaseMonkeyObject {
    constructor(
        public value: number,
        public isReturn: boolean = false,
    ) {}
}

export class BooleanObject implements BaseMonkeyObject {
    constructor(
        public value: boolean,
        public isReturn: boolean = false,
    ) {}
}

export class NullObject implements BaseMonkeyObject {
    public value: null;
    constructor(
        public isReturn: boolean = false,
    ) {}
}

export class FunctionObject implements BaseMonkeyObject {
    public value: null;
    
    constructor(
        public args: string[],
        public environment: InterpreterStack,
        public body: BlockStatementNode,
        public isReturn: boolean = false,
    ) {}
}
