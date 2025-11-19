import { PageSection, Panel, Content } from '@patternfly/react-core';
import React from 'react';
import ServersTableToolbar from './components/ServersTableToolbar';
import ServersTable from './components/ServersTable';
import { parseAsArrayOf, parseAsString, parseAsStringEnum, parseAsBoolean, useQueryStates } from 'nuqs';
import { ClusterStates, CloudProvider } from '@app/types/types';
import { useLocation } from 'react-router-dom';

const filterParams = {
  status: {
    ...parseAsStringEnum<ClusterStates>(Object.values(ClusterStates)),
    defaultValue: null as ClusterStates | null,
  },
  provider: parseAsArrayOf(parseAsStringEnum<CloudProvider>(Object.values(CloudProvider))).withDefault([]),
  serverName: parseAsString.withDefault(''),
  archived: parseAsBoolean.withDefault(false),
};

const Servers: React.FunctionComponent = () => {
  const location = useLocation();
  const [{ status, provider, serverName, archived }, setQuery] = useQueryStates(filterParams);

  // React to URL changes
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newArchived = params.get('archived') === 'true';

    if (archived !== newArchived) {
      setQuery({
        archived: newArchived,
        status: null,
        provider: [],
      });
    }
  }, [location.search, archived, setQuery]);

  return (
    <React.Fragment>
      <PageSection hasBodyWrapper={false}>
        <Content>
          <Content component="h1">Servers {archived ? '- History' : '- Active'}</Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled>
        <Panel>
          <ServersTableToolbar
            searchValue={serverName}
            setSearchValue={value => setQuery({ serverName: value })}
            statusSelection={status}
            setStatusSelection={value => setQuery({ status: value })}
            providerSelections={provider}
            setProviderSelections={value => setQuery({ provider: value || [] })}
            archived={archived}
          />
          <ServersTable
            searchValue={serverName}
            statusSelection={status}
            providerSelections={provider}
            archived={archived}
          />
        </Panel>
      </PageSection>
    </React.Fragment>
  );
};

export default Servers;
