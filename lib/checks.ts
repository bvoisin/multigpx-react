export function checkEquals(expected: any, actual: any, message?:string) {
    if (expected !== actual) {
        throw new Error(`Expected ${expected} to equal ${actual}: ${message}`);
    }
}