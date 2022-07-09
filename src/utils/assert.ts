export default function assert(value: unknown, error: string): asserts value {
    if (value === undefined || value === null || value === false) {
        throw new Error(error);
    }
};