import { IntegerObject, BooleanObject, BaseMonkeyObject, StringObject } from "./interpreterTypes";
import { TokenType } from "./token";

export type PrefixOperationFunction = (obj: BaseMonkeyObject) => BaseMonkeyObject;
export type InfixOperationFunction = (leftObj: BaseMonkeyObject, rightObj: BaseMonkeyObject) => BaseMonkeyObject;

type PrefixOperation = {
    operator: TokenType,
    objectType: string,
    operation: PrefixOperationFunction,
}

type InfixOperation = {
    operator: TokenType,
    leftObjectType: string,
    rightObjectType: string,
    operation: InfixOperationFunction,
}

const appliablePrefixOperations: PrefixOperation[] = [
    {
        operator: TokenType.MINUS,
        objectType: IntegerObject.name,
        operation: minusIntegerObject,
    },
    {
        operator: TokenType.BANG,
        objectType: BooleanObject.name,
        operation: bangBooleanObject,
    }
];

const appliableInfixOperations: InfixOperation[] = [
    {
        operator: TokenType.PLUS,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: plusIntegerObjects
    },
    {
        operator: TokenType.MINUS,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: minusIntegerObjects,
        
    },
    {
        operator: TokenType.ASTERISK,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: starIntegerObjects,
        
    },
    {
        operator: TokenType.SLASH,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: slashIntegerObjects,
        
    },
    {
        operator: TokenType.LT,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: ltIntegerObjects,
    },
    {
        operator: TokenType.GT,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: gtIntegerObjects,
    },
    {
        operator: TokenType.EQ,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: eqIntegerObjects,
    },
    {
        operator: TokenType.NEQ,
        leftObjectType: IntegerObject.name,
        rightObjectType: IntegerObject.name,
        operation: neqIntegerObjects,
    },
    {
        operator: TokenType.EQ,
        leftObjectType: IntegerObject.name,
        rightObjectType: BooleanObject.name,
        operation: eqIntegerBooleanObjects,
    },
    {
        operator: TokenType.NEQ,
        leftObjectType: IntegerObject.name,
        rightObjectType: BooleanObject.name,
        operation: neqIntegerBooleanObjects,
    },
    {
        operator: TokenType.EQ,
        leftObjectType: BooleanObject.name,
        rightObjectType: BooleanObject.name,
        operation: eqBooleanObjects,
    },
    {
        operator: TokenType.NEQ,
        leftObjectType: BooleanObject.name,
        rightObjectType: BooleanObject.name,
        operation: neqBooleanObjects,
    },
    {
        operator: TokenType.EQ,
        leftObjectType: BooleanObject.name,
        rightObjectType: IntegerObject.name,
        operation: eqBooleanIntegerObjects,
    },
    {
        operator: TokenType.NEQ,
        leftObjectType: BooleanObject.name,
        rightObjectType: IntegerObject.name,
        operation: neqBooleanIntegerObjects,
    },
    {
        operator: TokenType.PLUS,
        leftObjectType: StringObject.name,
        rightObjectType: StringObject.name,
        operation: plusStringObjects
    },
];

export function findPrefixOperation(operator: TokenType, obj: BaseMonkeyObject): PrefixOperationFunction | null {
    return appliablePrefixOperations.find(op => op.operator === operator && obj.constructor.name === op.objectType)?.operation || null;
}

export function findInfixOperation(operator: TokenType, leftObj: BaseMonkeyObject, rightObj: BaseMonkeyObject): InfixOperationFunction | null {
    return appliableInfixOperations.find(op => 
        op.operator === operator && op.leftObjectType === leftObj.constructor.name && op.rightObjectType === rightObj.constructor.name)?.operation || null;
}

function minusIntegerObject(obj: IntegerObject): IntegerObject {
    return new IntegerObject(-obj.value);
}

function bangBooleanObject(obj: BooleanObject): BooleanObject {
    return new BooleanObject(!obj.value);
}

function minusIntegerObjects(left: IntegerObject, right: IntegerObject): IntegerObject {
    return new IntegerObject(left.value - right.value);
}

function plusIntegerObjects(left: IntegerObject, right: IntegerObject): IntegerObject {
    return new IntegerObject(left.value + right.value);
}

function slashIntegerObjects(left: IntegerObject, right: IntegerObject): IntegerObject {
    return new IntegerObject(Math.floor(left.value / right.value));
}

function starIntegerObjects(left: IntegerObject, right: IntegerObject): IntegerObject {
    return new IntegerObject(left.value * right.value);
}

function ltIntegerObjects(left: IntegerObject, right: IntegerObject): BooleanObject {
    return new BooleanObject(left.value < right.value);
}

function gtIntegerObjects(left: IntegerObject, right: IntegerObject): BooleanObject {
    return new BooleanObject(left.value > right.value);
}

function eqIntegerObjects(left: IntegerObject, right: IntegerObject): BooleanObject {
    return new BooleanObject(left.value === right.value);
}

function neqIntegerObjects(left: IntegerObject, right: IntegerObject): BooleanObject {
    return new BooleanObject(left.value !== right.value);
}

function eqBooleanObjects(left: BooleanObject, right: BooleanObject): BooleanObject {
    return new BooleanObject(left.value === right.value); 
}

function neqBooleanObjects(left: BooleanObject, right: BooleanObject): BooleanObject {
    return new BooleanObject(left.value !== right.value);
}

function eqIntegerBooleanObjects(_left: IntegerObject, _right: BooleanObject): BooleanObject {
    return new BooleanObject(false);
}

function eqBooleanIntegerObjects(_left: BooleanObject, _right: IntegerObject): BooleanObject {
    return new BooleanObject(false);
}

function neqIntegerBooleanObjects(_left: IntegerObject, _right: BooleanObject): BooleanObject {
    return new BooleanObject(true);
}

function neqBooleanIntegerObjects(_left: BooleanObject, _right: IntegerObject): BooleanObject {
    return new BooleanObject(true);
}

function plusStringObjects(left: StringObject, right: StringObject): StringObject {
    return new StringObject(left.value + right.value);
}