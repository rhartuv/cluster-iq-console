/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardBody, CardTitle, Grid, GridItem, PageSection, Content } from '@patternfly/react-core';
import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { generateCards } from './components/CardData';
import { CloudProvider } from './types';
import { renderContent } from './components/CardRenderer';
import { useDashboardData } from './hooks/useDashboardData';
import { useEventsData } from './hooks/useEventsData';

const AggregateStatusCards: React.FunctionComponent = () => {
  const { inventoryData } = useDashboardData();
  const { events, loading: eventsLoading, error: eventsError } = useEventsData();

  if (!inventoryData) {
    return <LoadingSpinner />;
  }

  const dashboardState = {
    clustersByStatus: {
      running: inventoryData?.clusters?.running || 0,
      stopped: inventoryData?.clusters?.stopped || 0,
      unknown: inventoryData?.clusters?.unknown || 0,
      terminated: inventoryData?.clusters?.archived || 0,
    },
    instancesByStatus: {
      running: 0, // Not available in current API
      stopped: 0, // Not available in current API
      unknown: 0, // Not available in current API
      terminated: 0, // Not available in current API
    },
    clustersByProvider: {
      [CloudProvider.AWS]: inventoryData.providers.aws?.cluster_count || 0,
      [CloudProvider.GCP]: inventoryData.providers.gcp?.cluster_count || 0,
      [CloudProvider.AZURE]: inventoryData.providers.azure?.cluster_count || 0,
    },
    accountsByProvider: {
      [CloudProvider.AWS]: inventoryData.providers.aws?.account_count || 0,
      [CloudProvider.GCP]: inventoryData.providers.gcp?.account_count || 0,
      [CloudProvider.AZURE]: inventoryData.providers.azure?.account_count || 0,
    },
    instances: inventoryData.instances.count,
    lastScanTimestamp: inventoryData.scanner?.last_scan_timestamp,
  };

  const cardData = generateCards(dashboardState, events);

  return (
    <React.Fragment>
      <PageSection
        hasBodyWrapper={false}
        style={{ marginBottom: '1rem', paddingBottom: '1rem', backgroundColor: '#e5e5e5' }}
      >
        <Content>
          <Content component="h1" style={{ color: '#000000' }}>
            Overview
          </Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ marginTop: '1rem' }}>
        <Grid hasGutter>
          {Object.entries(cardData).map(([groupName, cards], groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupName === 'activityCards' ? (
                // Full width Activity card with double height
                <GridItem span={12}>
                  <Card style={{ minHeight: '500px' }} component="div">
                    <CardTitle style={{ textAlign: 'center' }}>{cards[0].title}</CardTitle>
                    <CardBody style={{ minHeight: '450px', padding: '1rem' }}>
                      {eventsLoading ? (
                        <LoadingSpinner />
                      ) : eventsError ? (
                        <div style={{ color: 'red' }}>
                          Error: {eventsError}
                          <br />
                          <small>Check console for details</small>
                        </div>
                      ) : cards[0].customComponent ? (
                        cards[0].customComponent
                      ) : (
                        renderContent(cards[0].content, cards[0].layout)
                      )}
                    </CardBody>
                  </Card>
                </GridItem>
              ) : (
                // Cards in 2 rows of 3 boxes each (span={4} means 3 per row)
                cards.map((card, cardIndex) => (
                  <GridItem key={`${groupIndex}${cardIndex}`} span={4}>
                    <Card style={{ textAlign: 'center' }} component="div">
                      <CardTitle>{card.title}</CardTitle>
                      <CardBody>{renderContent(card.content, card.layout)}</CardBody>
                    </Card>
                  </GridItem>
                ))
              )}
            </React.Fragment>
          ))}
        </Grid>
      </PageSection>
    </React.Fragment>
  );
};

export default AggregateStatusCards;
