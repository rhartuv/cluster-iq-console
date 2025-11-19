import { PageSection, Panel, Content } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AccountsToolbar from './components/AccountsToolbar';
import AccountsTable from './components/AccountsTable';

const Accounts: React.FunctionComponent = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [providerSelections, setProviderSelections] = useState<string[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cloudProviderFilter = queryParams.get('cloudProvider');

  return (
    <React.Fragment>
      <PageSection hasBodyWrapper={false}>
        <Content>
          <Content component="h1">Accounts</Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled>
        <Panel>
          <AccountsToolbar
            onSearchChange={setSearchValue}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            setProviderSelections={setProviderSelections}
            providerSelections={providerSelections}
          />
          <AccountsTable
            searchValue={searchValue}
            cloudProviderFilter={cloudProviderFilter}
            providerSelections={providerSelections}
            statusFilter={null}
          />
        </Panel>
      </PageSection>
    </React.Fragment>
  );
};

export default Accounts;
