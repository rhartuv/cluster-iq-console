import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { TagData, ClusterData, ClusterStates } from '@app/types/types';
import { parseNumberToCurrency, parseScanTimestamp } from '@app/utils/parseFuncs';
import { renderStatusLabel } from '@app/utils/renderUtils';
import {
  Flex,
  FlexItem,
  Title,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  TabContentBody,
  Page,
  PageSection,
  Label,
  Divider,
  Tabs,
  Tab,
  TabTitleText,
  TabContent,
} from '@patternfly/react-core';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ClusterDetailsDropdown } from './ClusterDetailsDropdown';
import { ClusterDetailsEvents } from './ClusterDetailsEvents';
import { getCluster, getClusterTags } from '@app/services/api';
import ClusterDetailsInstances from './ClusterDetailsInstances';
import { LabelGroupOverflow } from '@app/components/common/LabelGroupOverflow';

const ClusterDetailsOverview: React.FunctionComponent = () => {
  const { clusterID } = useParams();
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  const [tags, setTagData] = useState<TagData>({
    count: 0,
    tags: [],
  });
  const [cluster, setClusterData] = useState<ClusterData>({
    count: 0,
    clusters: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCluster = await getCluster(clusterID);
        setClusterData(fetchedCluster);
        const fetchedTags = await getClusterTags(clusterID);
        setTagData(fetchedTags);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterTagsByKey = key => {
    const result = tags.tags.filter(tags => tags.key == key);
    if (result[0] !== undefined && result[0] != null) {
      return result[0].value;
    }
    return 'unknown';
  };

  const ownerTag = filterTagsByKey('Owner');
  const partnerTag = filterTagsByKey('Partner');
  const clusterStatus = cluster?.clusters[0]?.status as ClusterStates | null;

  const handleTabClick = (_, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  const detailsTabContent = (
    <React.Fragment>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Flex direction={{ default: 'column' }}>
          <FlexItem spacer={{ default: 'spacerLg' }}>
            <Title headingLevel="h2" size="lg" className="pf-v5-u-mt-sm" id="open-tabs-example-tabs-list-details-title">
              Cluster details
            </Title>
          </FlexItem>

          <FlexItem>
            <DescriptionList
              columnModifier={{ lg: '2Col' }}
              aria-labelledby="open-tabs-example-tabs-list-details-title"
            >
              <DescriptionListGroup name="Basic Info">
                <DescriptionListTerm>Name</DescriptionListTerm>
                <DescriptionListDescription>{clusterID}</DescriptionListDescription>
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>{renderStatusLabel(cluster.clusters[0].status)}</DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup name="Cluster links">
                <DescriptionListTerm>Web console</DescriptionListTerm>
                <DescriptionListDescription>
                  <a href={cluster.clusters[0].consoleLink} target="_blank" rel="noopener noreferrer">
                    Console
                  </a>
                </DescriptionListDescription>
                <DescriptionListTerm>Number of nodes</DescriptionListTerm>
                <DescriptionListDescription>{String(cluster.clusters[0].instanceCount)}</DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup name="Cloud Properties">
                <DescriptionListTerm>Cloud Provider</DescriptionListTerm>
                <DescriptionListDescription>{cluster.clusters[0].provider}</DescriptionListDescription>
                <DescriptionListTerm>Account</DescriptionListTerm>
                <DescriptionListDescription>{cluster.clusters[0].accountName || 'unknown'}</DescriptionListDescription>
                <DescriptionListTerm>Region</DescriptionListTerm>
                <DescriptionListDescription>{cluster.clusters[0].region || 'unknown'}</DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup name="Timestamps">
                <DescriptionListTerm>Created at</DescriptionListTerm>
                <DescriptionListDescription>
                  {parseScanTimestamp(cluster.clusters[0].creationTimestamp)}
                </DescriptionListDescription>
                <DescriptionListTerm>Last scanned at</DescriptionListTerm>
                <DescriptionListDescription>
                  {parseScanTimestamp(cluster.clusters[0].lastScanTimestamp)}
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup name="Extra metadata">
                <DescriptionListTerm>Labels</DescriptionListTerm>
                <LabelGroupOverflow labels={tags.tags} />
                <DescriptionListTerm>Partner</DescriptionListTerm>
                <DescriptionListDescription>{partnerTag}</DescriptionListDescription>
                <DescriptionListTerm>Owner</DescriptionListTerm>
                <DescriptionListDescription>{ownerTag}</DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup name="Costs">
                <DescriptionListTerm>
                  Cluster Total Cost (Estimated since the cluster is being scanned)
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {parseNumberToCurrency(cluster.clusters[0].totalCost)}
                </DescriptionListDescription>
                <DescriptionListTerm>Cluster Total (Current month so far)</DescriptionListTerm>
                <DescriptionListDescription>
                  {parseNumberToCurrency(cluster.clusters[0].currentMonthSoFarCost)}
                </DescriptionListDescription>
                <DescriptionListTerm>Cluster Total (Last 15 days)</DescriptionListTerm>
                <DescriptionListDescription>
                  {parseNumberToCurrency(cluster.clusters[0].last15DaysCost)}
                </DescriptionListDescription>
                <DescriptionListTerm>Cluster Total (Last Month)</DescriptionListTerm>
                <DescriptionListDescription>
                  {parseNumberToCurrency(cluster.clusters[0].lastMonthCost)}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </FlexItem>
        </Flex>
      )}
    </React.Fragment>
  );

  const serversTabContent = useMemo(
    () => (
      <TabContentBody>
        <ClusterDetailsInstances />
      </TabContentBody>
    ),
    []
  );

  const eventsTabContent = useMemo(
    () => (
      <TabContentBody>
        <ClusterDetailsEvents />
      </TabContentBody>
    ),
    []
  );

  return (
    <Page>
      <PageSection hasBodyWrapper={false}>
        <Flex
          spaceItems={{ default: 'spaceItemsMd' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem>
            <Label color="blue">Cluster</Label>
          </FlexItem>

          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {clusterID}
            </Title>
          </FlexItem>

          <FlexItem align={{ default: 'alignRight' }}>
            <ClusterDetailsDropdown clusterStatus={clusterStatus} />
          </FlexItem>
        </Flex>
        {/* Page tabs */}
      </PageSection>
      <PageSection hasBodyWrapper={false} type="tabs">
        <Divider />
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} usePageInsets id="open-tabs-example-tabs-list">
          <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} tabContentId={`tabContent${0}`} />
          <Tab eventKey={1} title={<TabTitleText>Servers</TabTitleText>} tabContentId={`tabContent${1}`} />
          <Tab eventKey={2} title={<TabTitleText>Events</TabTitleText>} tabContentId={`tabContent${2}`} />
        </Tabs>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <TabContent key={0} eventKey={0} id={`tabContent${0}`} activeKey={activeTabKey} hidden={0 !== activeTabKey}>
          <TabContentBody>{detailsTabContent}</TabContentBody>
        </TabContent>
        <TabContent key={1} eventKey={1} id={`tabContent${1}`} activeKey={activeTabKey} hidden={1 !== activeTabKey}>
          <TabContentBody>{serversTabContent}</TabContentBody>
        </TabContent>
        <TabContent key={2} eventKey={2} id={`tabContent${2}`} activeKey={activeTabKey} hidden={2 !== activeTabKey}>
          <TabContentBody>{eventsTabContent}</TabContentBody>
        </TabContent>
      </PageSection>
    </Page>
  );
};
export default ClusterDetailsOverview;
