export abstract class BaseMonkeyObject {
    public value: number | boolean | null;
}

export class IntegerObject implements BaseMonkeyObject {
    constructor(
        public value: number,
    ) {}
}

export class BooleanObject implements BaseMonkeyObject {
    constructor(
        public value: boolean,
    ) {}
}

export class NullObject implements BaseMonkeyObject {
    public value: null;
}

