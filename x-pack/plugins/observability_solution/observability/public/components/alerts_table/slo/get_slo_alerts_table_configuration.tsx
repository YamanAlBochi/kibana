/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SortOrder } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { ALERT_DURATION } from '@kbn/rule-data-utils';
import { AlertsTableConfigurationRegistry } from '@kbn/triggers-actions-ui-plugin/public/types';
import { casesFeatureId, observabilityFeatureId } from '../../../../common';
import { getRenderCellValue } from '../common/render_cell_value';
import { columns } from './default_columns';
import { useGetAlertFlyoutComponents } from '../../alerts_flyout/use_get_alert_flyout_components';
import type { ObservabilityRuleTypeRegistry } from '../../../rules/create_observability_rule_type_registry';
import type { ConfigSchema } from '../../../plugin';
import { SLO_ALERTS_TABLE_CONFIG_ID } from '../../../embeddable/slo/constants';

export const getSloAlertsTableConfiguration = (
  observabilityRuleTypeRegistry: ObservabilityRuleTypeRegistry,
  config: ConfigSchema
): AlertsTableConfigurationRegistry => ({
  id: SLO_ALERTS_TABLE_CONFIG_ID,
  cases: { featureId: casesFeatureId, owner: [observabilityFeatureId] },
  columns,
  getRenderCellValue: ({ setFlyoutAlert }) =>
    getRenderCellValue({
      observabilityRuleTypeRegistry,
      setFlyoutAlert,
    }),
  sort: [
    {
      [ALERT_DURATION]: {
        order: 'desc' as SortOrder,
      },
    },
  ],

  useInternalFlyout: () => {
    const { header, body, footer } = useGetAlertFlyoutComponents(observabilityRuleTypeRegistry);
    return { header, body, footer };
  },
});
