import { StdioMCPClient } from './stdio';
import { Toolkit } from '../tool';

describe('StdIOMCPClient', () => {
    test('Create StdIOMCPClient, list and execute tools', async () => {
        const client = new StdioMCPClient({
            name: 'playwright-mcp',
            command: 'npx',
            args: ['@playwright/mcp@latest'],
        });

        await client.connect();

        const tools = await client.listTools();
        expect(tools.length).toBeGreaterThan(0);

        const tool = await client.getCallableFunction({ name: 'browser_navigate' });
        const res = await tool.call({ url: 'http://www.baidu.com' });
        expect(res.content.length).toBeGreaterThan(0);
        expect(res.content[0].type).toBe('text');

        await client.close();

        await client.connect();
        const tools2 = await client.listTools();
        expect(tools2.length).toBeGreaterThan(0);
        await client.close();
    }, 20000);

    test('Test toolkit works with StdioMCPClient', async () => {
        const client = new StdioMCPClient({
            name: 'playwright-mcp',
            command: 'npx',
            args: ['@playwright/mcp@latest'],
        });
        await client.connect();

        const toolkit = new Toolkit();
        await toolkit.registerMCPClient({ client: client, enabledTools: ['browser_navigate'] });

        const schema = toolkit.getJSONSchemas();
        expect(schema.length).toBe(2);
        expect(schema[1].type).toBe('function');
        expect(schema[1].function.name).toBe('browser_navigate');
        expect(schema[1].function.parameters).toBeDefined();

        const res = toolkit.callToolFunction({
            id: '123',
            name: 'browser_navigate',
            type: 'tool_call',
            input: `{"url": "http://www.baidu.com"}`,
        });
        for await (const item of res) {
            expect(item.content.length).toBeGreaterThan(0);
            expect(item.content[0].type).toBe('text');
        }

        await client.close();
    }, 30000);
});
