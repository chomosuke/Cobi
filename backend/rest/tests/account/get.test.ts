const mockContext = {
    authUrl: 'https://somehost',
    prisma: undefined,
};

describe('read account', () => {
    it('should return 401 if unauthenticated', () => {
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/login')
            .send(payload);
    });
});
