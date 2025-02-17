/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiFieldText,
  EuiModal,
  EuiSpacer,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import type { MlJob } from '@elastic/elasticsearch/lib/api/types';
import type { SingleMetricViewerServices } from '..';
import type { TimeRangeBounds } from '../../application/util/time_buckets';
import { SeriesControls } from '../../application/timeseriesexplorer/components/series_controls';
import {
  APP_STATE_ACTION,
  type TimeseriesexplorerActionType,
} from '../../application/timeseriesexplorer/timeseriesexplorer_constants';

export interface SingleMetricViewerInitializerProps {
  bounds: TimeRangeBounds;
  defaultTitle: string;
  initialInput?: SingleMetricViewerServices;
  job: MlJob;
  onCreate: (props: {
    panelTitle: string;
    functionDescription?: string;
    selectedDetectorIndex: number;
    selectedEntities: any;
  }) => void;
  onCancel: () => void;
}

export const SingleMetricViewerInitializer: FC<SingleMetricViewerInitializerProps> = ({
  bounds,
  defaultTitle,
  initialInput,
  job,
  onCreate,
  onCancel,
}) => {
  const [panelTitle, setPanelTitle] = useState<string>(defaultTitle);
  const [functionDescription, setFunctionDescription] = useState<string | undefined>();
  const [selectedDetectorIndex, setSelectedDetectorIndex] = useState<number>(0);
  const [selectedEntities, setSelectedEntities] = useState<any>();

  const isPanelTitleValid = panelTitle.length > 0;

  const handleStateUpdate = (action: TimeseriesexplorerActionType, payload: any) => {
    switch (action) {
      case APP_STATE_ACTION.SET_ENTITIES:
        setSelectedEntities(payload);
        break;
      case APP_STATE_ACTION.SET_FUNCTION_DESCRIPTION:
        setFunctionDescription(payload);
        break;
      case APP_STATE_ACTION.SET_DETECTOR_INDEX:
        setSelectedDetectorIndex(payload);
        break;
      default:
        break;
    }
  };

  return (
    <EuiModal
      maxWidth={false}
      initialFocus="[name=panelTitle]"
      onClose={onCancel}
      data-test-subj={'mlSingleMetricViewerEmbeddableInitializer'}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <FormattedMessage
            id="xpack.ml.SingleMetricViewerEmbeddable.setupModal.title"
            defaultMessage="Single metric viewer configuration"
          />
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiForm>
          <EuiFormRow
            label={
              <FormattedMessage
                id="xpack.ml.singleMetricViewerEmbeddable.panelTitleLabel"
                defaultMessage="Panel title"
              />
            }
            isInvalid={!isPanelTitleValid}
          >
            <EuiFieldText
              data-test-subj="panelTitleInput"
              id="panelTitle"
              name="panelTitle"
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              isInvalid={!isPanelTitleValid}
            />
          </EuiFormRow>
          <EuiSpacer />
          <SeriesControls
            selectedJobId={job.job_id}
            job={job}
            appStateHandler={handleStateUpdate}
            selectedDetectorIndex={selectedDetectorIndex}
            selectedEntities={selectedEntities}
            bounds={bounds}
            functionDescription={functionDescription}
            setFunctionDescription={setFunctionDescription}
          />
        </EuiForm>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty
          onClick={onCancel}
          data-test-subj="mlsingleMetricViewerInitializerCancelButton"
        >
          <FormattedMessage
            id="xpack.ml.singleMetricViewerEmbeddable.setupModal.cancelButtonLabel"
            defaultMessage="Cancel"
          />
        </EuiButtonEmpty>

        <EuiButton
          data-test-subj="mlsingleMetricViewerInitializerConfirmButton"
          isDisabled={!isPanelTitleValid}
          onClick={onCreate.bind(null, {
            functionDescription,
            panelTitle,
            selectedDetectorIndex,
            selectedEntities,
          })}
          fill
        >
          <FormattedMessage
            id="xpack.ml.singleMetricViewerEmbeddable.setupModal.confirmButtonLabel"
            defaultMessage="Confirm configurations"
          />
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
