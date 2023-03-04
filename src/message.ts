export default class Message {
    private nolog: boolean;
    private silent: boolean;
    constructor(nolog: boolean, silent: boolean) {
        this.silent = silent;
        this.nolog = nolog;
    }
    create(...message: string[]): void {
        if (!this.nolog) {
            console.log(...message);
        }
    }
    error(message: string): void {
        if (!this.silent) {
            throw new Error(message);
        }
    }
}