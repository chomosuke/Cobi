export class DataIntegrityError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'DataIntegrityError';
    }
}
