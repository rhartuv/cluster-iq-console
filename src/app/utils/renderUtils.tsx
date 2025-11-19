import { ClusterStates, ResultStatus } from '@app/types/types';
import React from 'react';
import { Label } from '@patternfly/react-core';
import { InfoCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon, UnknownIcon } from '@patternfly/react-icons';

export function renderStatusLabel(labelText: string | null | undefined) {
  switch (labelText) {
    case ClusterStates.Running:
      return <Label color="green">{labelText}</Label>;
    case ClusterStates.Stopped:
      return <Label color="red">{labelText}</Label>;
    case ClusterStates.Terminated:
      return <Label color="purple">{labelText}</Label>;
    case ClusterStates.Unknown:
      return <Label color="yellow">{labelText}</Label>;
    default:
      return <Label color="grey">{labelText}</Label>;
  }
}

export const getResultIcon = (result: ResultStatus) => {
  return (
    {
      [ResultStatus.Success]: (
        <InfoCircleIcon color="var(pf-t--global--icon--color--status--success--default)" title="Info" />
      ),
      [ResultStatus.Failed]: (
        <ExclamationTriangleIcon color="var(pf-t--global--icon--color--status--danger--default)" title="Error" />
      ),
      [ResultStatus.Warning]: (
        <ExclamationCircleIcon color="var(pf-t--global--icon--color--status--warning--default)" title="Warning" />
      ),
    }[result] || <UnknownIcon color="gray" title="Unknown" />
  );
};
