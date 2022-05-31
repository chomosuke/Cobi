import * as bcrypt from 'bcrypt';

export async function hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
}
