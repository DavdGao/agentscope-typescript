import { z } from 'zod';

import { ExternalExecutionResultEvent, UserConfirmResultEvent } from '../event';
import { Msg, ToolCallBlock } from '../message';
import { ToolChoice } from '../type';

export interface ReplyOptions {
    msgs?: Msg | Msg[];
    event?: UserConfirmResultEvent | ExternalExecutionResultEvent;
    structuredModel?: z.ZodObject;
}

export interface ReasoningOptions {
    toolChoice?: ToolChoice;
}

export interface ActingOptions {
    toolCall: ToolCallBlock;
}

export interface ObserveOptions {
    msg?: Msg | Msg[];
}
