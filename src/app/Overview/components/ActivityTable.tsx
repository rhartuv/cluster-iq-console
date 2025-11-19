import React from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Event } from '@app/types/events';
import { CheckCircleIcon, ErrorCircleOIcon, WarningTriangleIcon } from '@patternfly/react-icons';

interface ActivityTableProps {
  events: Event[];
}

const getResultIcon = (result: string) => {
  const PATTERNFLY_COLORS = {
    success: 'var(--pf-t--temp--dev--tbd)' /* CODEMODS: original v5 color was --pf-v5-global--success-color--100 */,
    danger: 'var(--pf-t--temp--dev--tbd)' /* CODEMODS: original v5 color was --pf-v5-global--danger-color--100 */,
    warning: 'var(--pf-t--temp--dev--tbd)' /* CODEMODS: original v5 color was --pf-v5-global--warning-color--100 */,
  } as const;

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
            <Td>{event.action}</Td>
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
