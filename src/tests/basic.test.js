// Simple test to verify Jest is working
describe('Basic Jest Test', () => {
    it('should pass a basic test', () => {
        expect(1 + 1).toBe(2);
    });

    it('should handle async operations', async () => {
        const promise = Promise.resolve('success');
        await expect(promise).resolves.toBe('success');
    });
});
