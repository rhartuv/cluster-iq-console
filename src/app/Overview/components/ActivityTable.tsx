import React from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Event } from '@app/types/events';
import { CheckCircleIcon, ErrorCircleOIcon, WarningTriangleIcon } from '@patternfly/react-icons';

interface ActivityTableProps {
  events: Event[];
}

const PATTERNFLY_COLORS = {
  success: 'var(--pf-t--global--icon--color--status--success--default)',
  danger: 'var(--pf-t--global--icon--color--status--danger--default)',
  warning: 'var(--pf-t--global--border--color--status--warning--default)',
} as const;

const getResultIcon = (result: string) => {
  switch (result.toLowerCase()) {
    case 'success':
      return <CheckCircleIcon color={PATTERNFLY_COLORS.success} />;
    case 'failed':
    case 'failure':
      return <ErrorCircleOIcon color={PATTERNFLY_COLORS.danger} />;
    case 'warning':
    case 'partial':
      return <WarningTriangleIcon color={PATTERNFLY_COLORS.warning} />;
    default:
      return <WarningTriangleIcon color={PATTERNFLY_COLORS.warning} />;
  }
};

const capitalizeAction = (action: string): string => {
  if (!action) return action;
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
};

export const ActivityTable: React.FunctionComponent<ActivityTableProps> = ({ events }) => {
  if (events.length === 0) {
    return <div>No recent events</div>;
  }

  return (
    <Table aria-label="Recent events table" variant="compact">
      <Thead>
        <Tr>
          <Th></Th>
          <Th>Time</Th>
          <Th>Action</Th>
          <Th>Result</Th>
          <Th>Resource</Th>
          <Th>Triggered By</Th>
        </Tr>
      </Thead>
      <Tbody>
        {events.map(event => (
          <Tr key={event.id}>
            <Td>{getResultIcon(event.result)}</Td>
            <Td>{new Date(event.timestamp).toLocaleString()}</Td>
            <Td>{capitalizeAction(event.action)}</Td>
            <Td>{event.result}</Td>
            <Td>
              {event.resourceType} {event.resourceId}
            </Td>
            <Td>{event.triggeredBy}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
