/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import {
  EuiBadge,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiProgress,
  EuiScreenReaderOnly,
  EuiText,
  EuiToolTip,
  EuiLink,
  RIGHT_ALIGNMENT,
} from '@elastic/eui';
import {
  getAnalysisType,
  type DataFrameAnalyticsId,
  type DataFrameAnalyticsStats,
} from '@kbn/ml-data-frame-analytics-utils';
import type { DataFrameAnalyticsListRow } from './common';
import {
  getDataFrameAnalyticsProgressPhase,
  isDataFrameAnalyticsFailed,
  isDataFrameAnalyticsRunning,
  isDataFrameAnalyticsStopped,
  DataFrameAnalyticsListColumn,
} from './common';
import { useActions } from './use_actions';
import { useMlLink } from '../../../../../contexts/kibana';
import { ML_PAGES } from '../../../../../../../common/constants/locator';

const TRUNCATE_TEXT_LINES = 3;

enum TASK_STATE_COLOR {
  analyzing = 'primary',
  failed = 'danger',
  reindexing = 'primary',
  started = 'primary',
  starting = 'primary',
  stopped = 'hollow',
  stopping = 'hollow',
}

export const getTaskStateBadge = (
  state: DataFrameAnalyticsStats['state'],
  failureReason?: DataFrameAnalyticsStats['failure_reason']
) => {
  const color = TASK_STATE_COLOR[state];

  if (isDataFrameAnalyticsFailed(state) && failureReason !== undefined) {
    return (
      <EuiToolTip content={failureReason}>
        <EuiBadge className="mlTaskStateBadge" color={color}>
          {state}
        </EuiBadge>
      </EuiToolTip>
    );
  }

  return (
    <EuiBadge className="mlTaskStateBadge" color={color}>
      {state}
    </EuiBadge>
  );
};

export const getJobTypeBadge = (jobType: string) => (
  <EuiBadge className="mlTaskStateBadge" color="hollow">
    {jobType}
  </EuiBadge>
);

export const progressColumn = {
  name: i18n.translate('xpack.ml.dataframe.analyticsList.progress', {
    defaultMessage: 'Progress',
  }),
  truncateText: true,
  render(item: DataFrameAnalyticsListRow) {
    const { currentPhase, progress, totalPhases } = getDataFrameAnalyticsProgressPhase(item.stats);

    // For now all analytics jobs are batch jobs.
    const isBatchTransform = true;

    return (
      <EuiFlexGroup alignItems="center" gutterSize="xs">
        {isBatchTransform && (
          <Fragment>
            <EuiFlexItem style={{ width: '60px' }} grow={false}>
              <EuiText size="xs">
                Phase {currentPhase}/{totalPhases}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem style={{ width: '40px' }} grow={false}>
              <EuiToolTip
                content={i18n.translate('xpack.ml.dataframe.analyticsList.progressOfPhase', {
                  defaultMessage: 'Progress of phase {currentPhase}: {progress}%',
                  values: {
                    currentPhase,
                    progress,
                  },
                })}
              >
                <EuiProgress
                  value={progress}
                  max={100}
                  color="primary"
                  size="m"
                  data-test-subj="mlAnalyticsTableProgress"
                />
              </EuiToolTip>
            </EuiFlexItem>
          </Fragment>
        )}
        {!isBatchTransform && (
          <Fragment>
            <EuiFlexItem style={{ width: '40px' }} grow={false}>
              {isDataFrameAnalyticsRunning(item.stats.state) && (
                <EuiProgress color="primary" size="m" />
              )}
              {isDataFrameAnalyticsStopped(item.stats.state) && (
                <EuiProgress value={0} max={100} color="primary" size="m" />
              )}
            </EuiFlexItem>
            <EuiFlexItem style={{ width: '35px' }} grow={false}>
              &nbsp;
            </EuiFlexItem>
          </Fragment>
        )}
      </EuiFlexGroup>
    );
  },
  width: '130px',
  'data-test-subj': 'mlAnalyticsTableColumnProgress',
};

export const DFAnalyticsJobIdLink = ({ jobId }: { jobId: string }) => {
  const href = useMlLink({
    page: ML_PAGES.DATA_FRAME_ANALYTICS_JOBS_MANAGE,
    pageState: { jobId },
  });

  return (
    <EuiLink href={href} css={{ overflow: 'hidden', 'text-overflow': 'ellipsis' }} title={jobId}>
      {jobId}
    </EuiLink>
  );
};

export const useColumns = (
  expandedRowItemIds: DataFrameAnalyticsId[],
  setExpandedRowItemIds: React.Dispatch<React.SetStateAction<DataFrameAnalyticsId[]>>,
  isMlEnabledInSpace: boolean = true,
  refresh: () => void = () => {}
) => {
  const { actions, modals } = useActions();
  function toggleDetails(item: DataFrameAnalyticsListRow) {
    const index = expandedRowItemIds.indexOf(item.config.id);
    if (index !== -1) {
      expandedRowItemIds.splice(index, 1);
      setExpandedRowItemIds([...expandedRowItemIds]);
    } else {
      expandedRowItemIds.push(item.config.id);
    }

    // spread to a new array otherwise the component wouldn't re-render
    setExpandedRowItemIds([...expandedRowItemIds]);
  }
  // update possible column types to something like (FieldDataColumn | ComputedColumn | ActionsColumn)[] when they have been added to EUI
  const columns: any[] = [
    {
      name: (
        <EuiScreenReaderOnly>
          <p>
            <FormattedMessage
              id="xpack.ml.dataframe.analyticsList.showDetailsColumn.screenReaderDescription"
              defaultMessage="This column contains clickable controls for showing more details on each job"
            />
          </p>
        </EuiScreenReaderOnly>
      ),
      align: RIGHT_ALIGNMENT,
      width: '40px',
      isExpander: true,
      render: (item: DataFrameAnalyticsListRow) => (
        <EuiButtonIcon
          onClick={() => toggleDetails(item)}
          aria-label={
            expandedRowItemIds.includes(item.config.id)
              ? i18n.translate('xpack.ml.dataframe.analyticsList.rowCollapse', {
                  defaultMessage: 'Hide details for {analyticsId}',
                  values: { analyticsId: item.config.id },
                })
              : i18n.translate('xpack.ml.dataframe.analyticsList.rowExpand', {
                  defaultMessage: 'Show details for {analyticsId}',
                  values: { analyticsId: item.config.id },
                })
          }
          iconType={expandedRowItemIds.includes(item.config.id) ? 'arrowDown' : 'arrowRight'}
        />
      ),
      'data-test-subj': 'mlAnalyticsTableRowDetailsToggle',
    },
    {
      field: DataFrameAnalyticsListColumn.id,
      name: i18n.translate('xpack.ml.dataframe.analyticsList.id', {
        defaultMessage: 'ID',
      }),
      sortable: (item: DataFrameAnalyticsListRow) => item.id,
      truncateText: { lines: TRUNCATE_TEXT_LINES },
      'data-test-subj': 'mlAnalyticsTableColumnId',
      scope: 'row',
      render: (id: string) => {
        return <span title={id}>{id}</span>;
      },
    },
    {
      field: DataFrameAnalyticsListColumn.description,
      name: i18n.translate('xpack.ml.dataframe.analyticsList.description', {
        defaultMessage: 'Description',
      }),
      sortable: true,
      truncateText: { lines: TRUNCATE_TEXT_LINES },
      'data-test-subj': 'mlAnalyticsTableColumnJobDescription',
      render: (description: string) => {
        return <span title={description}>{description}</span>;
      },
    },
    {
      field: DataFrameAnalyticsListColumn.memoryStatus,
      name: i18n.translate('xpack.ml.dataframe.analyticsList.memoryStatus', {
        defaultMessage: 'Memory status',
      }),
      truncateText: true,
      'data-test-subj': 'mlAnalyticsTableColumnJobMemoryStatus',
    },
    {
      field: DataFrameAnalyticsListColumn.configSourceIndex,
      name: i18n.translate('xpack.ml.dataframe.analyticsList.sourceIndex', {
        defaultMessage: 'Source index',
      }),
      sortable: true,
      truncateText: true,
      'data-test-subj': 'mlAnalyticsTableColumnSourceIndex',
    },
    {
      field: DataFrameAnalyticsListColumn.configDestIndex,
      name: i18n.translate('xpack.ml.dataframe.analyticsList.destinationIndex', {
        defaultMessage: 'Destination index',
      }),
      sortable: true,
      truncateText: true,
      'data-test-subj': 'mlAnalyticsTableColumnDestIndex',
    },
    {
      name: i18n.translate('xpack.ml.dataframe.analyticsList.type', { defaultMessage: 'Type' }),
      sortable: (item: DataFrameAnalyticsListRow) => getAnalysisType(item.config.analysis),
      truncateText: true,
      render(item: DataFrameAnalyticsListRow) {
        return getJobTypeBadge(getAnalysisType(item.config.analysis));
      },
      width: '150px',
      'data-test-subj': 'mlAnalyticsTableColumnType',
    },
    {
      name: i18n.translate('xpack.ml.dataframe.analyticsList.status', { defaultMessage: 'Status' }),
      sortable: (item: DataFrameAnalyticsListRow) => item.stats.state,
      truncateText: true,
      render(item: DataFrameAnalyticsListRow) {
        return getTaskStateBadge(item.stats.state, item.stats.failure_reason);
      },
      width: '100px',
      'data-test-subj': 'mlAnalyticsTableColumnStatus',
    },
    progressColumn,
    {
      name: i18n.translate('xpack.ml.dataframe.analyticsList.tableActionLabel', {
        defaultMessage: 'Actions',
      }),
      actions,
      width: '150px',
      'data-test-subj': 'mlAnalyticsTableColumnActions',
    },
  ];

  return { columns, modals };
};
