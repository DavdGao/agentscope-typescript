import { Agent, AgentOptions } from '@agentscope-ai/agentscope/agent';
import {
    AgentEvent,
    ExternalExecutionResultEvent,
    UserConfirmResultEvent,
} from '@agentscope-ai/agentscope/event';
import { Msg } from '@agentscope-ai/agentscope/message';

export type AgentEventCallback = (event: AgentEvent) => void;

/**
 * Runs an agent with the provided options and streams events to the callback.
 *
 * @param agentOptions - Configuration options for the agent.
 * @param onEvent - Callback function to handle agent events.
 * @param msgs - Optional message or array of messages to process.
 * @param event - Optional user confirmation or external execution result event.
 * @returns A promise that resolves when the agent finishes processing.
 */
export async function runAgent(
    agentOptions: AgentOptions,
    onEvent: AgentEventCallback,
    msgs?: Msg | Msg[],
    event?: UserConfirmResultEvent | ExternalExecutionResultEvent
): Promise<void> {
    const agent = new Agent(agentOptions);

    for await (const agentEvent of agent.replyStream({ msgs, event })) {
        onEvent(agentEvent);
    }
}
