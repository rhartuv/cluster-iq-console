import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { AuditEvent, CloudProvider, ClusterActions, ResultStatus } from '@app/types/types';
import { getSystemEvents } from '@app/services/api';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { useEffect, useState } from 'react';
import { getResultIcon } from '@app/utils/renderUtils';
import { useTableSort } from '@app/hooks/useTableSort.tsx';
import { EmptyState } from '@patternfly/react-core';
import { TablePagination } from '@app/components/common/TablesPagination';
import { getPaginatedSlice } from '@app/utils/tablePagination';
import { SearchIcon } from '@patternfly/react-icons';
import { AuditLogsTableProps } from './types';
import { Link } from 'react-router-dom';

const columnNames = {
  action: 'Action',
  result: 'Result',
  resource: 'Resource',
  account: 'Account',
  provider: 'Provider',
  loggedBy: 'Logged by',
  description: 'Description',
  date: 'Date',
};

const EmptyStateNoFound: React.FunctionComponent = () => (
  <EmptyState headingLevel="h4" icon={SearchIcon} titleText="No events"></EmptyState>
);

export const AuditLogsTable: React.FunctionComponent<AuditLogsTableProps> = ({
  accountName,
  action,
  provider,
  result,
  triggered_by,
}) => {
  // Pagination settings
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [filteredCount, setFilteredCount] = useState(0);

  const [data, setData] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<AuditEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const systemEvents = await getSystemEvents();
        setData(systemEvents);
      } catch (error) {
        console.error('Error fetching system wide events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when data or filter props change
  useEffect(() => {
    let filtered = data;

    if (accountName) {
      filtered = filtered.filter(event => event.account_id?.toLowerCase().includes(accountName.toLowerCase()));
    }

    if (action?.length) {
      filtered = filtered.filter(event => action.includes(event.action_name as ClusterActions));
    }

    if (provider?.length) {
      filtered = filtered.filter(event => provider.includes(event.provider as CloudProvider));
    }

    if (result?.length) {
      filtered = filtered.filter(event => result.includes(event.result as ResultStatus));
    }

    if (triggered_by) {
      filtered = filtered.filter(event => event.triggered_by?.toLowerCase().includes(triggered_by.toLowerCase()));
    }

    setFilteredCount(filtered.length);
    setFilteredData(getPaginatedSlice(filtered, page, perPage));
  }, [data, accountName, action, provider, result, triggered_by, page, perPage]);

  const getSortableRowValues = (event: AuditEvent): (string | number | null)[] => {
    const { action_name, result, resource_id, account_id, provider, triggered_by, description, event_timestamp } =
      event;
    return [
      action_name,
      result,
      resource_id,
      account_id ?? null,
      provider ?? null,
      triggered_by,
      description ?? null,
      event_timestamp,
    ];
  };

  const { sortedData, getSortParams } = useTableSort<AuditEvent>(filteredData, getSortableRowValues, 7, 'desc');

  if (loading) return <LoadingSpinner />;
  if (filteredCount === 0) return <EmptyStateNoFound />;

  return (
    <React.Fragment>
      <Table aria-label="Events table">
        <Thead>
          <Tr>
            <Th sort={getSortParams(0)}>{columnNames.action}</Th>
            <Th sort={getSortParams(1)}>{columnNames.result}</Th>
            <Th sort={getSortParams(2)}>{columnNames.resource}</Th>
            <Th sort={getSortParams(3)}>{columnNames.account}</Th>
            <Th sort={getSortParams(4)}>{columnNames.provider}</Th>
            <Th sort={getSortParams(5)}>{columnNames.loggedBy}</Th>
            <Th>{columnNames.description}</Th>
            <Th sort={getSortParams(7)}>{columnNames.date}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map(event => (
            <Tr key={event.id}>
              <Td>{event.action_name}</Td>
              <Td>
                {getResultIcon(event.result as ResultStatus)} {event.result}
              </Td>
              {/*TODO. Hardcoded, adjust later if needed*/}
              <Td dataLabel={event.resource_id}>
                <Link
                  to={
                    event.resource_type === 'instance'
                      ? `/servers/${event.resource_id}`
                      : `/clusters/${event.resource_id}`
                  }
                >
                  {event.resource_id}
                </Link>
              </Td>
              <Td>{event.account_id}</Td>
              <Td>{event.provider}</Td>
              <Td>{event.triggered_by}</Td>
              <Td>{event.description}</Td>
              <Td>{event.event_timestamp}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <TablePagination
        itemCount={filteredCount}
        page={page}
        perPage={perPage}
        onSetPage={setPage}
        onPerPageSelect={setPerPage}
      />
    </React.Fragment>
  );
};

export default AuditLogsTable;
