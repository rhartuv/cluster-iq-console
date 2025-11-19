import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import {
  deleteScheduledAction,
  disableScheduledAction,
  enableScheduledAction,
  getScheduledActions,
} from '@app/services/api';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { useEffect, useState } from 'react';
import { useTableSort } from '@app/hooks/useTableSort.tsx';
import { Button, EmptyState } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { TablePagination } from '@app/components/common/TablesPagination';
import { getPaginatedSlice } from '@app/utils/tablePagination';
import { SearchIcon } from '@patternfly/react-icons';
import { apiOperationToClusterAction, ScheduledAction, SchedulerTableProps } from './types';
import { Link } from 'react-router-dom';

const columnNames = {
  operation: 'Action',
  type: 'Type',
  time: 'Time',
  accountName: 'Account',
  clusterID: 'Cluster',
  enabled: 'Enabled',
  status: 'Status',
};

const EmptyStateNoFound: React.FunctionComponent = () => (
  <EmptyState headingLevel="h4" icon={SearchIcon} titleText="No scheduled actions"></EmptyState>
);

export const SchedulerTable: React.FunctionComponent<SchedulerTableProps> = ({
  type,
  action,
  accountName,
  cluster,
  status,
  enabled,
}) => {
  // Pagination settings
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [filteredCount, setFilteredCount] = useState(0);

  const [data, setData] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<ScheduledAction[]>([]);
  const [modalState, setModalState] = useState<{ isOpen: boolean; action: string; selectedId: string | null }>({
    isOpen: false,
    action: '',
    selectedId: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getScheduledActions();
        setData(response);
      } catch (error) {
        console.error('Error fetching scheduled actions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when data or filter props change
  useEffect(() => {
    let filtered = data;

    if (type) {
      filtered = filtered.filter(item => item.type === type);
    }

    if (accountName) {
      filtered = filtered.filter(item => item.target.accountName.toLowerCase().includes(accountName.toLowerCase()));
    }

    if (action?.length) {
      filtered = filtered.filter(item => {
        const normalizedOperation = apiOperationToClusterAction[item.operation] || item.operation;
        return action.includes(normalizedOperation as never);
      });
    }

    if (cluster) {
      filtered = filtered.filter(item => item.target.clusterID.toLowerCase().includes(cluster.toLowerCase()));
    }

    if (status) {
      filtered = filtered.filter(item => item.status === status);
    }

    if (enabled === 'yes') {
      filtered = filtered.filter(item => item.enabled);
    } else if (enabled === 'no') {
      filtered = filtered.filter(item => item.enabled === false);
    }

    setFilteredCount(filtered.length);
    setFilteredData(getPaginatedSlice(filtered, page, perPage));
  }, [data, type, accountName, action, cluster, status, enabled, page, perPage]);

  const getSortableRowValues = (scheduledAction: ScheduledAction): (string | number | null)[] => {
    const { operation, type, time, cronExp, target, status, enabled } = scheduledAction;
    return [
      operation,
      type,
      time || cronExp || null,
      target.accountName,
      target.clusterID,
      enabled ? 'Yes' : 'No',
      status,
    ];
  };

  const { sortedData, getSortParams } = useTableSort<ScheduledAction>(filteredData, getSortableRowValues, 2, 'desc');

  const openModal = (action: 'enable' | 'disable' | 'delete', id: string) => {
    setModalState({
      isOpen: true,
      action: action,
      selectedId: id,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      action: '',
      selectedId: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!modalState.selectedId) return;
    const id = modalState.selectedId;

    try {
      let responseStatus;

      if (modalState.action === 'delete') {
        responseStatus = await deleteScheduledAction(id);
        if (responseStatus === 200) {
          setData(prev => prev.filter(item => item.id !== id)); // Remove from UI only on success
        }
      } else if (modalState.action === 'enable') {
        responseStatus = await enableScheduledAction(id);
        if (responseStatus === 200) {
          setData(prev => prev.map(item => (item.id === id ? { ...item, enabled: true } : item)));
        }
      } else if (modalState.action === 'disable') {
        responseStatus = await disableScheduledAction(id);
        if (responseStatus === 200) {
          setData(prev => prev.map(item => (item.id === id ? { ...item, enabled: false } : item)));
        }
      }

      if (responseStatus !== 200) {
        console.error(`Failed to ${modalState.action} action, received status: ${responseStatus}`);
      }
    } catch (error) {
      console.error(`Failed to ${modalState.action} action`, error);
    } finally {
      closeModal();
    }
  };

  const getRowActions = (scheduledAction: ScheduledAction): IAction[] => [
    {
      title: scheduledAction.enabled ? 'Disable' : 'Enable',
      onClick: () => openModal(scheduledAction.enabled ? 'disable' : 'enable', scheduledAction.id),
    },
    {
      title: 'Delete',
      onClick: () => openModal('delete', scheduledAction.id),
    },
  ];

  if (loading) return <LoadingSpinner />;
  if (filteredCount === 0) return <EmptyStateNoFound />;

  return (
    <>
      <Table aria-label="Scheduler table">
        <Thead>
          <Tr>
            <Th sort={getSortParams(0)}>{columnNames.operation}</Th>
            <Th sort={getSortParams(1)}>{columnNames.type}</Th>
            <Th sort={getSortParams(2)}>{columnNames.time}</Th>
            <Th sort={getSortParams(3)}>{columnNames.accountName}</Th>
            <Th sort={getSortParams(4)}>{columnNames.clusterID}</Th>
            <Th sort={getSortParams(5)}>{columnNames.enabled}</Th>
            <Th sort={getSortParams(6)}>{columnNames.status}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map(action => (
            <Tr key={action.id}>
              <Td>{apiOperationToClusterAction[action.operation] || action.operation}</Td>
              <Td>{action.type}</Td>
              <Td>{action.time || action.cronExp}</Td>
              <Td>{action.target.accountName}</Td>
              <Td>
                <Link to={`/clusters/${action.target.clusterID}`}>{action.target.clusterID}</Link>
              </Td>
              <Td>{action.enabled ? 'Yes' : 'No'}</Td>
              <Td>{action.status}</Td>
              <Td isActionCell>
                <ActionsColumn items={getRowActions(action)} />
              </Td>
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
      <Modal
        title="Confirmation"
        isOpen={modalState.isOpen}
        onClose={closeModal}
        variant={ModalVariant.small}
        actions={[
          <Button
            key="confirm"
            variant={modalState.action === 'delete' ? 'danger' : 'primary'}
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={closeModal}>
            Cancel
          </Button>,
        ]}
      >
        {`Are you sure you want to ${modalState.action} this scheduled action?`}
      </Modal>
    </>
  );
};

export default SchedulerTable;
