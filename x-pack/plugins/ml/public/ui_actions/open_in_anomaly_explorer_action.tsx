/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import type { SerializableRecord } from '@kbn/utility-types';
import type { UiActionsActionDefinition } from '@kbn/ui-actions-plugin/public';
import { ML_ENTITY_FIELD_OPERATIONS } from '@kbn/ml-anomaly-utils';
import type { MlCoreSetup } from '../plugin';
import { ML_APP_LOCATOR } from '../../common/constants/locator';
import type { AnomalyChartsFieldSelectionContext, SwimLaneDrilldownContext } from '../embeddables';
import {
  ANOMALY_EXPLORER_CHARTS_EMBEDDABLE_TYPE,
  ANOMALY_SWIMLANE_EMBEDDABLE_TYPE,
  isAnomalyExplorerEmbeddable,
  isSwimLaneEmbeddable,
} from '../embeddables';
import type { ExplorerAppState } from '../../common/types/locator';

export const OPEN_IN_ANOMALY_EXPLORER_ACTION = 'openInAnomalyExplorerAction';

export function createOpenInExplorerAction(
  getStartServices: MlCoreSetup['getStartServices']
): UiActionsActionDefinition<SwimLaneDrilldownContext | AnomalyChartsFieldSelectionContext> {
  return {
    id: 'open-in-anomaly-explorer',
    type: OPEN_IN_ANOMALY_EXPLORER_ACTION,
    getIconType(context): string {
      return 'visTable';
    },
    getDisplayName() {
      return i18n.translate('xpack.ml.actions.openInAnomalyExplorerTitle', {
        defaultMessage: 'Open in Anomaly Explorer',
      });
    },
    async getHref(context): Promise<string | undefined> {
      const [, pluginsStart] = await getStartServices();
      const locator = pluginsStart.share.url.locators.get(ML_APP_LOCATOR)!;

      if (isSwimLaneEmbeddable(context)) {
        const { embeddable, data } = context;

        const { jobIds, timeRange, viewBy } = embeddable.getInput();
        const { perPage, fromPage } = embeddable.getOutput();

        return locator.getUrl({
          page: 'explorer',
          pageState: {
            jobIds,
            timeRange,
            mlExplorerSwimlane: {
              viewByFromPage: fromPage,
              viewByPerPage: perPage,
              viewByFieldName: viewBy,
              ...(data
                ? {
                    selectedType: data.type,
                    selectedTimes: data.times,
                    selectedLanes: data.lanes,
                  }
                : {}),
            },
          },
        });
      } else if (isAnomalyExplorerEmbeddable(context)) {
        const { embeddable } = context;

        const { jobIds, timeRange } = embeddable.getInput();
        const { entityFields } = embeddable.getOutput();

        let mlExplorerFilter: ExplorerAppState['mlExplorerFilter'] | undefined;
        if (
          Array.isArray(entityFields) &&
          entityFields.length === 1 &&
          entityFields[0].operation === ML_ENTITY_FIELD_OPERATIONS.ADD
        ) {
          const { fieldName, fieldValue } = entityFields[0];
          if (fieldName !== undefined && fieldValue !== undefined) {
            const influencersFilterQuery = {
              bool: {
                should: [
                  {
                    match_phrase: {
                      [fieldName]: String(fieldValue),
                    },
                  },
                ],
                minimum_should_match: 1,
              },
            };
            const filteredFields = [fieldName, fieldValue];
            mlExplorerFilter = {
              influencersFilterQuery,
              filterActive: true,
              queryString: `${fieldName}:"${fieldValue}"`,
              ...(Array.isArray(filteredFields) ? { filteredFields } : {}),
            };
          }
        }
        return locator.getUrl({
          page: 'explorer',
          pageState: {
            jobIds,
            timeRange,
            // @ts-ignore QueryDslQueryContainer is not compatible with SerializableRecord
            ...(mlExplorerFilter ? ({ mlExplorerFilter } as SerializableRecord) : {}),
            query: {},
          },
        });
      }
    },
    async execute(context) {
      if (!context.embeddable) {
        throw new Error('Not possible to execute an action without the embeddable context');
      }
      const [{ application }] = await getStartServices();
      const anomalyExplorerUrl = await this.getHref!(context);
      if (anomalyExplorerUrl) {
        await application.navigateToUrl(anomalyExplorerUrl!);
      }
    },
    async isCompatible({
      embeddable,
    }: SwimLaneDrilldownContext | AnomalyChartsFieldSelectionContext) {
      return (
        embeddable.type === ANOMALY_SWIMLANE_EMBEDDABLE_TYPE ||
        embeddable.type === ANOMALY_EXPLORER_CHARTS_EMBEDDABLE_TYPE
      );
    },
  };
}
