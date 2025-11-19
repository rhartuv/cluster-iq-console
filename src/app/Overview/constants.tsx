import { ClusterStates } from '@app/types/types';
import React from 'react';
import {
  CheckCircleIcon,
  ErrorCircleOIcon,
  WarningTriangleIcon,
  OpenshiftIcon,
  AwsIcon,
  GoogleIcon,
  AzureIcon,
  ArchiveIcon,
} from '@patternfly/react-icons';
import { CloudProvider } from './types';

const PATTERNFLY_COLORS = {
  success: 'var(--pf-t--temp--dev--tbd)' /* CODEMODS: original v5 color was --pf-v5-global--success-color--100 */,
  danger: 'var(--pf-t--temp--dev--tbd)' /* CODEMODS: original v5 color was --pf-v5-global--danger-color--100 */,
  warning: 'var(--pf-t--temp--dev--tbd)' /* CODEMODS: original v5 color was --pf-v5-global--warning-color--100 */,
  disabled: 'var(--pf-t--temp--dev--tbd)' /* CODEMODS: original v5 color was --pf-v5-global--disabled-color--100 */,
} as const;

const CLUSTER_ICON = <OpenshiftIcon color={PATTERNFLY_COLORS.danger} />;

const PROVIDER_ICONS = {
  [CloudProvider.AWS]: <AwsIcon color={PATTERNFLY_COLORS.danger} />,
  [CloudProvider.GCP]: <GoogleIcon color={PATTERNFLY_COLORS.danger} />,
  [CloudProvider.AZURE]: <AzureIcon color={PATTERNFLY_COLORS.danger} />,
} as const;

export const STATUSES = {
  running: {
    key: ClusterStates.Running,
    icon: <CheckCircleIcon color={PATTERNFLY_COLORS.success} />,
    route: '/clusters?status=Running',
  },
  stopped: {
    key: ClusterStates.Stopped,
    icon: <ErrorCircleOIcon color={PATTERNFLY_COLORS.danger} />,
    route: '/clusters?status=Stopped',
  },
  unknown: {
    key: ClusterStates.Unknown,
    icon: <WarningTriangleIcon color={PATTERNFLY_COLORS.warning} />,
    route: '/clusters?status=Unknown',
  },
  terminated: {
    key: ClusterStates.Terminated,
    icon: <ArchiveIcon color={PATTERNFLY_COLORS.disabled} />,
    route: '/clusters?archived=true',
  },
} as const;

export const CLOUD_PROVIDERS = {
  [CloudProvider.AWS]: {
    key: CloudProvider.AWS,
    title: 'AWS Clusters',
    icon: CLUSTER_ICON,
    providerIcon: PROVIDER_ICONS[CloudProvider.AWS],
  },
  [CloudProvider.GCP]: {
    key: CloudProvider.GCP,
    title: 'GCP Clusters',
    icon: CLUSTER_ICON,
    providerIcon: PROVIDER_ICONS[CloudProvider.GCP],
  },
  [CloudProvider.AZURE]: {
    key: CloudProvider.AZURE,
    title: 'Azure Clusters',
    icon: CLUSTER_ICON,
    providerIcon: PROVIDER_ICONS[CloudProvider.AZURE],
  },
} as const;
