/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { PluginInitializer, PluginInitializerContext } from '@kbn/core/public';
import { ObservabilityAIAssistantPlugin } from './plugin';
import type {
  ObservabilityAIAssistantPublicSetup,
  ObservabilityAIAssistantPublicStart,
  ObservabilityAIAssistantPluginSetupDependencies,
  ObservabilityAIAssistantPluginStartDependencies,
  ConfigSchema,
  ObservabilityAIAssistantService,
  ObservabilityAIAssistantChatService,
  RegisterRenderFunctionDefinition,
  RenderFunction,
} from './types';

export type {
  ObservabilityAIAssistantPublicSetup,
  ObservabilityAIAssistantPublicStart,
  ObservabilityAIAssistantService,
  ObservabilityAIAssistantChatService,
  RegisterRenderFunctionDefinition,
  RenderFunction,
};

export { AssistantAvatar } from './components/assistant_avatar';
export { ConnectorSelectorBase } from './components/connector_selector/connector_selector_base';
export { useAbortableAsync, type AbortableAsyncState } from './hooks/use_abortable_async';

export { createStorybookChatService, createStorybookService } from './storybook_mock';

export { ChatState } from './hooks/use_chat';

export { FeedbackButtons, type Feedback } from './components/buttons/feedback_buttons';
export { ChatItemControls } from './components/chat/chat_item_controls';

export { FailedToLoadResponse } from './components/message_panel/failed_to_load_response';

export { MessageText } from './components/message_panel/message_text';

export {
  type ChatActionClickHandler,
  ChatActionClickType,
  type ChatActionClickPayload,
} from './components/chat/types';

export {
  VisualizeESQLUserIntention,
  VISUALIZE_ESQL_USER_INTENTIONS,
} from '../common/functions/visualize_esql';

export { getAssistantSystemMessage } from './service/get_assistant_system_message';

export { isSupportedConnectorType } from '../common';
export { FunctionVisibility } from '../common';

export type { TelemetryEventTypeWithPayload } from './analytics';
export { ObservabilityAIAssistantTelemetryEventType } from './analytics/telemetry_event_type';

export type { Conversation, Message, KnowledgeBaseEntry } from '../common';
export { MessageRole, KnowledgeBaseEntryRole } from '../common';

export type {
  ObservabilityAIAssistantAPIClientRequestParamsOf,
  ObservabilityAIAssistantAPIEndpoint,
  APIReturnType,
} from './api';

export type { UseChatResult } from './hooks/use_chat';

export const plugin: PluginInitializer<
  ObservabilityAIAssistantPublicSetup,
  ObservabilityAIAssistantPublicStart,
  ObservabilityAIAssistantPluginSetupDependencies,
  ObservabilityAIAssistantPluginStartDependencies
> = (pluginInitializerContext: PluginInitializerContext<ConfigSchema>) =>
  new ObservabilityAIAssistantPlugin(pluginInitializerContext);
