import { Bash } from './bash';

describe('Bash', () => {
    test('Normal command execution', async () => {
        const bash = Bash();
        const result = await bash.call({
            command: 'echo "Hello World"',
        });

        expect(result.state).toBe('success');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        expect((result.content[0] as { type: 'text'; text: string }).text).toContain('Hello World');
    });

    test('Command with description parameter', async () => {
        const bash = Bash();
        const result = await bash.call({
            command: 'echo "Test"',
            description: 'Test command with description',
        });

        expect(result.state).toBe('success');
        expect(result.content).toHaveLength(1);
        expect((result.content[0] as { type: 'text'; text: string }).text).toContain('Test');
    });

    test('Error command - non-existent command', async () => {
        const bash = Bash();
        const result = await bash.call({
            command: 'nonexistentcommand123',
        });

        expect(result.state).toBe('error');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('Command failed');
        expect(text).toContain('nonexistentcommand123');
    });

    test('Error command - division by zero in bash', async () => {
        const bash = Bash();
        // In bash, division by zero causes an error
        const result = await bash.call({
            command: 'echo $((10/0))',
        });

        expect(result.state).toBe('error');
        expect(result.content).toHaveLength(1);
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('Command failed');
    });

    test('Timeout command', async () => {
        const bash = Bash();
        const result = await bash.call({
            command: 'sleep 5',
            timeout: 1000, // 1 second timeout
        });

        expect(result.state).toBe('error');
        expect(result.content).toHaveLength(1);
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('Command failed');
    }, 10000); // Increase Jest timeout for this test

    test('Command with custom timeout that succeeds', async () => {
        const bash = Bash();
        const result = await bash.call({
            command: 'sleep 1',
            timeout: 3000, // 3 second timeout
        });

        expect(result.state).toBe('success');
    }, 10000);

    test('Output truncation - exceeds 30000 characters', async () => {
        const bash = Bash();
        // Generate output longer than 30000 characters
        const result = await bash.call({
            command: 'for i in {1..10000}; do echo "This is line $i with some extra text"; done',
        });

        expect(result.state).toBe('success');
        expect(result.content).toHaveLength(1);
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('[Output truncated - exceeded 30000 characters]');
        expect(text.length).toBeLessThanOrEqual(30100); // Allow some buffer for truncation message
    }, 10000);

    test('Command with stderr output', async () => {
        const bash = Bash();
        // Use a command that writes to stderr
        const result = await bash.call({
            command: 'ls /nonexistent_directory_12345',
        });

        expect(result.state).toBe('error');
        expect(result.content).toHaveLength(1);
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('Command failed');
        expect(text).toContain('Stderr');
    });

    test('Command with both stdout and stderr', async () => {
        const bash = Bash();
        // Command that produces both stdout and stderr
        const result = await bash.call({
            command: 'echo "stdout message" && ls /nonexistent_directory_12345',
        });

        expect(result.state).toBe('error');
        expect(result.content).toHaveLength(1);
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('Command failed');
        expect(text).toContain('Stdout');
        expect(text).toContain('stdout message');
        expect(text).toContain('Stderr');
    });

    test('Maximum timeout enforcement', async () => {
        const bash = Bash();
        // Try to set timeout beyond maximum (600000ms)
        const result = await bash.call({
            command: 'echo "test"',
            timeout: 700000, // 700 seconds, should be capped at 600000
        });

        // Should still succeed because the command is fast
        expect(result.state).toBe('success');
    });

    test('Command with special characters', async () => {
        const bash = Bash();
        const result = await bash.call({
            command: 'echo "Special chars: $HOME | & ; < > ( ) { }"',
        });

        expect(result.state).toBe('success');
        expect(result.content).toHaveLength(1);
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('Special chars');
    });

    test('Multi-line output', async () => {
        const bash = Bash();
        const result = await bash.call({
            command: 'echo "Line 1" && echo "Line 2" && echo "Line 3"',
        });

        expect(result.state).toBe('success');
        expect(result.content).toHaveLength(1);
        const text = (result.content[0] as { type: 'text'; text: string }).text;
        expect(text).toContain('Line 1');
        expect(text).toContain('Line 2');
        expect(text).toContain('Line 3');
    });
});
