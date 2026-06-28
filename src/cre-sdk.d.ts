declare module "@chainlink/cre-sdk" {
    export function workflow(name: string, handler: (input: any) => Promise<any>): any;
    export function execute_api(url: string, options?: any): Promise<any>;
    export function execute_llm(prompt: string, options?: any): Promise<any>;
    export function deploy_contract(name: string, args: any[]): Promise<any>;
}
