import { BaseMonkeyObject } from "./interpreterTypes"

export class InterpreterStack {
    variableStack: Map<string, BaseMonkeyObject>[] = [];  
    
    private top(): Map<string, BaseMonkeyObject> {
        return this.variableStack[this.variableStack.length - 1];
    }
    
    public newScope(): void {
        this.variableStack.push(new Map<string, BaseMonkeyObject>());
    }
    
    public removeScope(): void {
        this.variableStack.pop();
    }
    
    public has(key: string): boolean {
        return this.top().has(key);
    } 
    
    public create(key: string, value: BaseMonkeyObject): void {
        this.top().set(key, value); 
    }
    
    public set(key: string, value: BaseMonkeyObject): void {
        for (let i = this.variableStack.length - 1; i >= 0; i--) {
            if (this.variableStack[i].has(key))
                this.variableStack[i].set(key, value); 
        }
    }
    
    public get(key: string): BaseMonkeyObject | undefined {
        for (let i = this.variableStack.length - 1; i >= 0; i--) {
            if (this.variableStack[i].has(key))
                return this.variableStack[i].get(key); 
        }
        return undefined;
    }
    
    public copy(): InterpreterStack {
        let stackCopy = new InterpreterStack(); 
        this.variableStack.forEach((scope) =>  {
            stackCopy.newScope(); 
            scope.forEach((v, k) => stackCopy.create(k, v));
        });

        return stackCopy;
    }
    
    public extend(other: InterpreterStack): void {
        other.variableStack.forEach((scope) => 
            scope.forEach((v, k) => this.create(k, v))
        );
    }
}
