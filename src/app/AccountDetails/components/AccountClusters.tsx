import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Switch,
  EmptyState,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { ClustersTable } from './ClustersTable';
import { getAccountClusters } from '@app/services/api';
import { debug } from '@app/utils/debugLogs';
import { Cluster } from '@app/types/types';

export const AccountClusters: React.FunctionComponent = () => {
  const [clusters, setClusters] = useState<Cluster[] | []>([]);
  const [showTerminated, setShowTerminated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { accountName } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        debug('Fetching data...');
        const fetchedAccountClusters = await getAccountClusters(accountName);
        debug('Fetched Account data:', fetchedAccountClusters);
        setClusters(fetchedAccountClusters);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountName]);

  // Filter terminated clusters
  const displayClusters = showTerminated ? clusters : clusters.filter(cluster => cluster.status !== 'Terminated');

  const handleToggleChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setShowTerminated(checked);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Switch
              id="show-terminated-clusters"
              label="Show terminated clusters"
              isChecked={showTerminated}
              onChange={handleToggleChange}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {displayClusters.length === 0 ? (
        <EmptyState
          titleText={
            <Title headingLevel="h4" size="md">
              No clusters found
            </Title>
          }
          icon={CubesIcon}
          variant={EmptyStateVariant.sm}
        >
          <EmptyStateBody>
            {!showTerminated ? (
              <>
                There are no active clusters.
                <br />
                Toggle &apos;Show terminated clusters&apos; to view all clusters.
              </>
            ) : (
              'No clusters found for this account.'
            )}
          </EmptyStateBody>
        </EmptyState>
      ) : (
        <ClustersTable clusters={displayClusters} />
      )}
    </>
  );
};
