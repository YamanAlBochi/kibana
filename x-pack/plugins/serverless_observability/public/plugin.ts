/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { CoreSetup, CoreStart, Plugin } from '@kbn/core/public';
import { i18n } from '@kbn/i18n';
import { appIds } from '@kbn/management-cards-navigation';
import { appCategories } from '@kbn/management-cards-navigation/src/types';
import { of } from 'rxjs';
import { navigationTree } from './navigation_tree';
import { createObservabilityDashboardRegistration } from './logs_signal/overview_registration';
import {
  ServerlessObservabilityPublicSetup,
  ServerlessObservabilityPublicStart,
  ServerlessObservabilityPublicSetupDependencies,
  ServerlessObservabilityPublicStartDependencies,
} from './types';

export class ServerlessObservabilityPlugin
  implements
    Plugin<
      ServerlessObservabilityPublicSetup,
      ServerlessObservabilityPublicStart,
      ServerlessObservabilityPublicSetupDependencies,
      ServerlessObservabilityPublicStartDependencies
    >
{
  public setup(
    _core: CoreSetup<
      ServerlessObservabilityPublicStartDependencies,
      ServerlessObservabilityPublicStart
    >,
    setupDeps: ServerlessObservabilityPublicSetupDependencies
  ): ServerlessObservabilityPublicSetup {
    setupDeps.observability.dashboard.register(
      createObservabilityDashboardRegistration({
        search: _core
          .getStartServices()
          .then(([_coreStart, startDeps]) => startDeps.data.search.search),
      })
    );

    setupDeps.discover.showInlineTopNav({ showLogsExplorerTabs: true });

    return {};
  }

  public start(
    core: CoreStart,
    setupDeps: ServerlessObservabilityPublicStartDependencies
  ): ServerlessObservabilityPublicStart {
    const { observabilityShared, serverless, management } = setupDeps;
    observabilityShared.setIsSidebarEnabled(false);

    const navigationTree$ = of(navigationTree);
    serverless.setProjectHome('/app/observability/landing');
    serverless.initNavigation(navigationTree$, { dataTestSubj: 'svlObservabilitySideNav' });

    management.setIsSidebarEnabled(false);
    management.setupCardsNavigation({
      enabled: true,
      hideLinksTo: [appIds.RULES],
      extendCardNavDefinitions: {
        aiAssistantManagementObservability: {
          category: appCategories.OTHER,
          title: i18n.translate('xpack.serverlessObservability.aiAssistantManagementTitle', {
            defaultMessage: 'AI assistant for Observability settings',
          }),
          description: i18n.translate(
            'xpack.serverlessObservability.aiAssistantManagementDescription',
            {
              defaultMessage: 'Manage your AI assistant for Observability settings.',
            }
          ),
          icon: 'sparkles',
        },
      },
    });
    return {};
  }

  public stop() {}
}
