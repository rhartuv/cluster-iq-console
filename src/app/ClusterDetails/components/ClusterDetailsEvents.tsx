import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { AuditEvent, ResultStatus } from '@app/types/types';
import { getClusterEvents } from '@app/services/api';
import { ThProps, Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getResultIcon } from '@app/utils/renderUtils';
import { useTableSort } from '@app/hooks/useTableSort.tsx';
import { EmptyState } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

interface TableEventsProps {
  data: AuditEvent[];
  getSortParams: (columnIndex: number) => ThProps['sort'];
}

const columnNames = {
  action: 'Action',
  result: 'Result',
  severity: 'Severity',
  loggedBy: 'Logged by',
  description: 'Description',
  date: 'Date',
};

export const EmptyStateNoFound: React.FunctionComponent = () => (
  <EmptyState headingLevel="h4" icon={SearchIcon} titleText="No events"></EmptyState>
);

const TableEvents: React.FunctionComponent<TableEventsProps> = ({ data, getSortParams }) => {
  return (
    <Table aria-label="Events table">
      <Thead>
        <Tr>
          <Th sort={getSortParams(0)}>{columnNames.action}</Th>
          <Th sort={getSortParams(1)}>{columnNames.result}</Th>
          <Th sort={getSortParams(2)}>{columnNames.severity}</Th>
          <Th sort={getSortParams(3)}>{columnNames.loggedBy}</Th>
          <Th>{columnNames.description}</Th>
          <Th sort={getSortParams(5)}>{columnNames.date}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map(event => (
          <Tr key={event.id}>
            <Td>{event.action_name}</Td>
            <Td>
              {getResultIcon(event.result as ResultStatus)} {event.result}
            </Td>
            <Td>{event.severity}</Td>
            <Td>{event.triggered_by}</Td>
            <Td>{event.description}</Td>
            <Td>{event.event_timestamp}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export const ClusterDetailsEvents: React.FunctionComponent = () => {
  const [data, setData] = useState<AuditEvent[] | []>([]);
  const [loading, setLoading] = useState(true);
  const { clusterID } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clusterEvents = await getClusterEvents(clusterID);
        // TODO. Move to debug
        console.log('Fetched events:', clusterEvents);
        setData(clusterEvents);
      } catch (error) {
        // TODO. Move to debug
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // TODO. Move to debug
  console.log('Rendered events data:', data);

  const getSortableRowValues = (event: AuditEvent): (string | number | null)[] => {
    const { action_name, result, severity, triggered_by, description: description, event_timestamp } = event;
    return [action_name, result, severity, triggered_by, description ?? null, event_timestamp];
  };

  const { sortedData, getSortParams } = useTableSort<AuditEvent>(data, getSortableRowValues, 5, 'desc');
  if (loading) return <LoadingSpinner />;
  if (sortedData.length === 0) return <EmptyStateNoFound />;
  return <TableEvents data={sortedData} getSortParams={getSortParams} />;
};
