import { z } from 'zod';

import { ToolResponse } from './response';
import { ToolInputSchema } from '../type';

export interface Tool {
    name: string;
    description: string;
    inputSchema: z.ZodObject | ToolInputSchema;
    call?: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input: any
    ) =>
        | string
        | Promise<string>
        | Generator<string>
        | AsyncGenerator<string>
        | ToolResponse
        | Promise<ToolResponse>
        | Generator<ToolResponse>
        | AsyncGenerator<ToolResponse>;
    requireUserConfirm?: boolean;
}
