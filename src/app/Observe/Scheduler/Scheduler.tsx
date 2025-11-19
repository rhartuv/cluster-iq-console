import { PageSection, Panel, Content } from '@patternfly/react-core';
import SchedulerTableToolbar from './SchedulerTableToolbar';
import { parseAsArrayOf, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { ClusterActions } from '@app/types/types';
import { SchedulerTable } from './SchedulerTable';
import React from 'react';

const filterParams = {
  accountName: parseAsString.withDefault(''),
  action: parseAsArrayOf(parseAsStringEnum<ClusterActions>(Object.values(ClusterActions))).withDefault([]),
  type: parseAsString.withDefault(''),
  status: parseAsString.withDefault(''),
  enabled: parseAsString.withDefault(''),
};

const Scheduler: React.FunctionComponent = () => {
  const [{ accountName, action, type, status, enabled }, setQuery] = useQueryStates(filterParams);

  return (
    <React.Fragment>
      <PageSection hasBodyWrapper={false}>
        <Content>
          <Content component="h1">Scheduled Actions</Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled>
        <Panel>
          <SchedulerTableToolbar
            searchValue={accountName}
            setSearchValue={value => setQuery({ accountName: value })}
            action={action}
            setAction={value => setQuery({ action: value || [] })}
            type={type}
            setType={value => setQuery({ type: value })}
            status={status}
            setStatus={value => setQuery({ status: value })}
            // TODO.
            // If someone will read this 'yes/no' bull**t I'm really sorry.
            enabled={enabled as '' | 'yes' | 'no'}
            setEnabled={value => setQuery({ enabled: value as '' | 'yes' | 'no' })}
          />
          <SchedulerTable
            type={type}
            accountName={accountName}
            action={action}
            cluster=""
            status={status}
            enabled={enabled as '' | 'yes' | 'no'}
          />
        </Panel>
      </PageSection>
    </React.Fragment>
  );
};

export default Scheduler;
