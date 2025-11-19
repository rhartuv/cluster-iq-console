import {
  SearchInput,
  MenuToggle,
  Menu,
  MenuContent,
  MenuList,
  MenuItem,
  Popper,
  Badge,
  Toolbar,
  ToolbarContent,
  ToolbarToggleGroup,
  ToolbarGroup,
  ToolbarItem,
  ToolbarFilter,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';
import { ClustersTableToolbarProps, FilterCategory } from '../types';
import debounce from 'lodash.debounce';
import { CloudProvider, ClusterStates } from '@app/types/types';

export const ClustersTableToolbar: React.FunctionComponent<ClustersTableToolbarProps> = ({
  filterCategory,
  setFilterCategory,
  filterValue,
  setFilterValue,
  statusSelection,
  setStatusSelection,
  providerSelections,
  setProviderSelections,
  archived,
}) => {
  const debouncedSearch = React.useMemo(() => debounce(setFilterValue, 300), [setFilterValue]);
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const categoryName = filterCategory === 'clusterName' ? 'Cluster Name' : 'Account Name';

  // Set up name search input
  const searchInput = (
    <SearchInput
      placeholder={`Filter by ${categoryName.toLowerCase()}`}
      value={filterValue}
      onChange={(_event, value) => debouncedSearch(value)}
      onClear={() => debouncedSearch('')}
    />
  );

  // Set up status filter (only for active view)
  const [isStatusMenuOpen, setIsStatusMenuOpen] = React.useState<boolean>(false);
  const statusToggleRef = React.useRef<HTMLButtonElement>(null);
  const statusMenuRef = React.useRef<HTMLDivElement>(null);
  const statusContainerRef = React.useRef<HTMLDivElement>(null);

  const handleStatusMenuKeys = (event: KeyboardEvent) => {
    if (isStatusMenuOpen && statusMenuRef.current?.contains(event.target as Node)) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsStatusMenuOpen(!isStatusMenuOpen);
        statusToggleRef.current?.focus();
      }
    }
  };

  const handleStatusClickOutside = (event: MouseEvent) => {
    if (isStatusMenuOpen && !statusMenuRef.current?.contains(event.target as Node)) {
      setIsStatusMenuOpen(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleStatusMenuKeys);
    window.addEventListener('click', handleStatusClickOutside);
    return () => {
      window.removeEventListener('keydown', handleStatusMenuKeys);
      window.removeEventListener('click', handleStatusClickOutside);
    };
  }, [isStatusMenuOpen, statusMenuRef]);

  const onStatusToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setTimeout(() => {
      if (statusMenuRef.current) {
        const firstElement = statusMenuRef.current.querySelector('li > button:not(:disabled)');
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
      }
    }, 0);
    setIsStatusMenuOpen(!isStatusMenuOpen);
  };

  function onStatusSelect(_event: React.MouseEvent | undefined, itemId: string | number | undefined) {
    if (typeof itemId === 'undefined') {
      return;
    }

    setStatusSelection(itemId as ClusterStates);
    setIsStatusMenuOpen(!isStatusMenuOpen);
  }

  const statusToggle = (
    <MenuToggle
      ref={statusToggleRef}
      onClick={onStatusToggleClick}
      isExpanded={isStatusMenuOpen}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by status
    </MenuToggle>
  );

  // Status menu only shows allowed states for active view
  const statusMenu = (
    <Menu ref={statusMenuRef} id="attribute-search-status-menu" onSelect={onStatusSelect} selected={statusSelection}>
      <MenuContent>
        <MenuList>
          <MenuItem itemId={ClusterStates.Unknown}>{ClusterStates.Unknown}</MenuItem>
          <MenuItem itemId={ClusterStates.Running}>{ClusterStates.Running}</MenuItem>
          <MenuItem itemId={ClusterStates.Stopped}>{ClusterStates.Stopped}</MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const statusSelect = archived ? null : (
    <div ref={statusContainerRef}>
      <Popper
        trigger={statusToggle}
        triggerRef={statusToggleRef}
        popper={statusMenu}
        popperRef={statusMenuRef}
        appendTo={statusContainerRef.current || undefined}
        isVisible={isStatusMenuOpen}
      />
    </div>
  );

  // Provider filter setup
  const [isProviderMenuOpen, setIsProviderMenuOpen] = React.useState<boolean>(false);
  const providerToggleRef = React.useRef<HTMLButtonElement>(null);
  const providerMenuRef = React.useRef<HTMLDivElement>(null);
  const providerContainerRef = React.useRef<HTMLDivElement>(null);

  const handleProviderMenuKeys = (event: KeyboardEvent) => {
    if (isProviderMenuOpen && providerMenuRef.current?.contains(event.target as Node)) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsProviderMenuOpen(!isProviderMenuOpen);
        providerToggleRef.current?.focus();
      }
    }
  };

  const handleProviderClickOutside = (event: MouseEvent) => {
    if (isProviderMenuOpen && !providerMenuRef.current?.contains(event.target as Node)) {
      setIsProviderMenuOpen(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleProviderMenuKeys);
    window.addEventListener('click', handleProviderClickOutside);
    return () => {
      window.removeEventListener('keydown', handleProviderMenuKeys);
      window.removeEventListener('click', handleProviderClickOutside);
    };
  }, [isProviderMenuOpen, providerMenuRef]);

  const onProviderMenuToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setTimeout(() => {
      if (providerMenuRef.current) {
        const firstElement = providerMenuRef.current.querySelector('li > button:not(:disabled)');
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
      }
    }, 0);
    setIsProviderMenuOpen(!isProviderMenuOpen);
  };

  function onProviderMenuSelect(event: React.MouseEvent | undefined, itemId: string | number | undefined) {
    if (typeof itemId === 'undefined') {
      return;
    }

    const provider = itemId as CloudProvider;
    setProviderSelections(
      providerSelections && providerSelections.includes(provider)
        ? providerSelections.filter(selection => selection !== provider)
        : provider
          ? [provider, ...(providerSelections || [])]
          : []
    );
  }

  const providerToggle = (
    <MenuToggle
      ref={providerToggleRef}
      onClick={onProviderMenuToggleClick}
      isExpanded={isProviderMenuOpen}
      {...(providerSelections &&
        providerSelections.length > 0 && {
          badge: <Badge isRead>{providerSelections.length}</Badge>,
        })}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by provider
    </MenuToggle>
  );

  const providerMenu = (
    <Menu
      ref={providerMenuRef}
      id="attribute-search-provider-menu"
      onSelect={onProviderMenuSelect}
      selected={providerSelections}
    >
      <MenuContent>
        <MenuList>
          <MenuItem hasCheckbox isSelected={providerSelections?.includes(CloudProvider.AWS)} itemId={CloudProvider.AWS}>
            AWS
          </MenuItem>
          <MenuItem hasCheckbox isSelected={providerSelections?.includes(CloudProvider.GCP)} itemId={CloudProvider.GCP}>
            Google Cloud
          </MenuItem>
          <MenuItem
            hasCheckbox
            isSelected={providerSelections?.includes(CloudProvider.Azure)}
            itemId={CloudProvider.Azure}
          >
            Azure
          </MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const providerSelect = (
    <div ref={providerContainerRef}>
      <Popper
        trigger={providerToggle}
        triggerRef={providerToggleRef}
        popper={providerMenu}
        popperRef={providerMenuRef}
        appendTo={providerContainerRef.current || undefined}
        isVisible={isProviderMenuOpen}
      />
    </div>
  );

  // Attribute selector setup
  const [activeAttributeMenu, setActiveAttributeMenu] = React.useState<FilterCategory | 'Status' | 'Provider'>(
    'clusterName'
  );
  const [isAttributeMenuOpen, setIsAttributeMenuOpen] = React.useState(false);
  const attributeToggleRef = React.useRef<HTMLButtonElement>(null);
  const attributeMenuRef = React.useRef<HTMLDivElement>(null);
  const attributeContainerRef = React.useRef<HTMLDivElement>(null);

  const handleAttributeMenuKeys = (event: KeyboardEvent) => {
    if (!isAttributeMenuOpen) {
      return;
    }
    if (
      attributeMenuRef.current?.contains(event.target as Node) ||
      attributeToggleRef.current?.contains(event.target as Node)
    ) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsAttributeMenuOpen(!isAttributeMenuOpen);
        attributeToggleRef.current?.focus();
      }
    }
  };

  const handleAttributeClickOutside = (event: MouseEvent) => {
    if (isAttributeMenuOpen && !attributeMenuRef.current?.contains(event.target as Node)) {
      setIsAttributeMenuOpen(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleAttributeMenuKeys);
    window.addEventListener('click', handleAttributeClickOutside);
    return () => {
      window.removeEventListener('keydown', handleAttributeMenuKeys);
      window.removeEventListener('click', handleAttributeClickOutside);
    };
  }, [isAttributeMenuOpen, attributeMenuRef]);

  const onAttributeToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setTimeout(() => {
      if (attributeMenuRef.current) {
        const firstElement = attributeMenuRef.current.querySelector('li > button:not(:disabled)');
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
      }
    }, 0);
    setIsAttributeMenuOpen(!isAttributeMenuOpen);
  };
  const onAttributeSelect = (_ev: React.MouseEvent | undefined, itemId: string | number | undefined) => {
    const selected = itemId as FilterCategory | 'Status' | 'Provider';
    setActiveAttributeMenu(selected);
    if (selected === 'clusterName' || selected === 'accountName') {
      setFilterCategory(selected);
    }
    setIsAttributeMenuOpen(!isAttributeMenuOpen);
  };
  const attributeToggle = (
    <MenuToggle
      ref={attributeToggleRef}
      onClick={onAttributeToggleClick}
      isExpanded={isAttributeMenuOpen}
      icon={<FilterIcon />}
    >
      {activeAttributeMenu === 'clusterName'
        ? 'Cluster Name'
        : activeAttributeMenu === 'accountName'
          ? 'Account Name'
          : activeAttributeMenu}
    </MenuToggle>
  );

  // Only show Status option in attribute menu for active view
  const attributeMenu = (
    <Menu ref={attributeMenuRef} onSelect={onAttributeSelect}>
      <MenuContent>
        <MenuList>
          <MenuItem itemId="clusterName">Cluster Name</MenuItem>
          <MenuItem itemId="accountName">Account Name</MenuItem>
          {!archived && <MenuItem itemId="Status">Status</MenuItem>}
          <MenuItem itemId="Provider">Provider</MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const attributeDropdown = (
    <div ref={attributeContainerRef}>
      <Popper
        trigger={attributeToggle}
        triggerRef={attributeToggleRef}
        popper={attributeMenu}
        popperRef={attributeMenuRef}
        appendTo={attributeContainerRef.current || undefined}
        isVisible={isAttributeMenuOpen}
      />
    </div>
  );

  return (
    <Toolbar
      id="attribute-search-filter-toolbar"
      clearAllFilters={() => {
        setFilterValue('');
        setStatusSelection(null);
        setProviderSelections(null);
      }}
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>{attributeDropdown}</ToolbarItem>
            <ToolbarFilter
              labels={filterValue !== '' ? [filterValue] : ([] as string[])}
              deleteLabel={() => setFilterValue('')}
              deleteLabelGroup={() => setFilterValue('')}
              categoryName={categoryName}
              showToolbarItem={activeAttributeMenu === 'accountName' || activeAttributeMenu === 'clusterName'}
            >
              {searchInput}
            </ToolbarFilter>
            {!archived && (
              <ToolbarFilter
                labels={statusSelection ? [statusSelection] : []}
                deleteLabel={() => setStatusSelection(null)}
                deleteLabelGroup={() => setStatusSelection(null)}
                categoryName="Status"
                showToolbarItem={activeAttributeMenu === 'Status'}
              >
                {statusSelect}
              </ToolbarFilter>
            )}
            <ToolbarFilter
              labels={providerSelections || []}
              deleteLabel={(category, chip) => onProviderMenuSelect(undefined, chip as string)}
              deleteLabelGroup={() => setProviderSelections([])}
              categoryName="Provider"
              showToolbarItem={activeAttributeMenu === 'Provider'}
            >
              {providerSelect}
            </ToolbarFilter>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ClustersTableToolbar;
