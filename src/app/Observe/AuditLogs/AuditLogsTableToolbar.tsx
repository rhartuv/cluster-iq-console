import {
  Badge,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Popper,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';
import { AuditLogsTableToolbarProps } from './types';
import debounce from 'lodash.debounce';
import { CloudProvider, ClusterActions, ResultStatus } from '@app/types/types';

type AttributeMenuOption = 'Account' | 'Provider' | 'Action' | 'Result' | 'TriggeredBy';

export const AuditLogsTableToolbar: React.FunctionComponent<AuditLogsTableToolbarProps> = ({
  searchValue,
  setSearchValue,
  action,
  setAction,
  result,
  setResult,
  triggered_by,
  setTriggeredBy,
  providerSelections,
  setProviderSelections,
}) => {
  const debouncedSearch = React.useMemo(() => debounce(setSearchValue, 300), [setSearchValue]);
  const debouncedTriggeredBy = React.useMemo(() => debounce(setTriggeredBy, 300), [setTriggeredBy]);
  const debouncedResult = React.useMemo(() => debounce(setResult, 300), [setResult]);

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      debouncedTriggeredBy.cancel();
      debouncedResult.cancel();
    };
  }, [debouncedSearch, debouncedTriggeredBy, debouncedResult]);

  // Set up name search input
  const searchInput = (
    <SearchInput
      placeholder="Filter by account name"
      value={searchValue}
      onChange={(_event, value) => debouncedSearch(value)}
      onClear={() => debouncedSearch('')}
    />
  );
  // Set up triggered by search input
  const triggeredByInput = (
    <SearchInput
      placeholder="Filter by user"
      value={searchValue}
      onChange={(_event, value) => debouncedTriggeredBy(value)}
      onClear={() => debouncedTriggeredBy('')}
    />
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

  function onProviderMenuSelect(_event: React.MouseEvent | undefined, itemId: string | number | undefined) {
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

  // Actions filter setup
  const [isActionMenuOpen, setIsActionMenuOpen] = React.useState<boolean>(false);
  const actionToggleRef = React.useRef<HTMLButtonElement>(null);
  const actionMenuRef = React.useRef<HTMLDivElement>(null);
  const actionContainerRef = React.useRef<HTMLDivElement>(null);

  const handleActionMenuKeys = (event: KeyboardEvent) => {
    if (isActionMenuOpen && actionMenuRef.current?.contains(event.target as Node)) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsActionMenuOpen(!isActionMenuOpen);
        actionToggleRef.current?.focus();
      }
    }
  };

  const handleActionClickOutside = (event: MouseEvent) => {
    if (isActionMenuOpen && !actionMenuRef.current?.contains(event.target as Node)) {
      setIsActionMenuOpen(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleActionMenuKeys);
    window.addEventListener('click', handleActionClickOutside);
    return () => {
      window.removeEventListener('keydown', handleActionMenuKeys);
      window.removeEventListener('click', handleActionClickOutside);
    };
  }, [isActionMenuOpen, actionMenuRef]);

  const onActionMenuToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setTimeout(() => {
      if (actionMenuRef.current) {
        const firstElement = actionMenuRef.current.querySelector('li > button:not(:disabled)');
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
      }
    }, 0);
    setIsActionMenuOpen(!isActionMenuOpen);
  };

  function onActionMenuSelect(_event: React.MouseEvent | undefined, itemId: string | number | undefined) {
    if (typeof itemId === 'undefined') {
      return;
    }

    const selectedAction = itemId as ClusterActions;
    setAction(
      action && action.includes(selectedAction)
        ? action.filter(item => item !== selectedAction)
        : selectedAction
          ? [selectedAction, ...(action || [])]
          : []
    );
  }

  const actionToggle = (
    <MenuToggle
      ref={actionToggleRef}
      onClick={onActionMenuToggleClick}
      isExpanded={isActionMenuOpen}
      {...(action &&
        action.length > 0 && {
          badge: <Badge isRead>{action.length}</Badge>,
        })}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by action
    </MenuToggle>
  );

  const actionMenu = (
    <Menu ref={actionMenuRef} id="attribute-search-action-menu" onSelect={onActionMenuSelect} selected={action}>
      <MenuContent>
        <MenuList>
          <MenuItem hasCheckbox isSelected={action?.includes(ClusterActions.PowerOn)} itemId={ClusterActions.PowerOn}>
            {ClusterActions.PowerOn}
          </MenuItem>
          <MenuItem hasCheckbox isSelected={action?.includes(ClusterActions.PowerOff)} itemId={ClusterActions.PowerOff}>
            {ClusterActions.PowerOff}
          </MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const actionSelect = (
    <div ref={actionContainerRef}>
      <Popper
        trigger={actionToggle}
        triggerRef={actionToggleRef}
        popper={actionMenu}
        popperRef={actionMenuRef}
        appendTo={actionContainerRef.current || undefined}
        isVisible={isActionMenuOpen}
      />
    </div>
  );

  // Result filter setup
  const [isResultMenuOpen, setIsResultMenuOpen] = React.useState<boolean>(false);
  const resultToggleRef = React.useRef<HTMLButtonElement>(null);
  const resultMenuRef = React.useRef<HTMLDivElement>(null);
  const resultContainerRef = React.useRef<HTMLDivElement>(null);

  const handleResultMenuKeys = (event: KeyboardEvent) => {
    if (isResultMenuOpen && resultMenuRef.current?.contains(event.target as Node)) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsResultMenuOpen(!isResultMenuOpen);
        resultToggleRef.current?.focus();
      }
    }
  };

  const handleResultClickOutside = (event: MouseEvent) => {
    if (isResultMenuOpen && !resultMenuRef.current?.contains(event.target as Node)) {
      setIsResultMenuOpen(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleResultMenuKeys);
    window.addEventListener('click', handleResultClickOutside);
    return () => {
      window.removeEventListener('keydown', handleResultMenuKeys);
      window.removeEventListener('click', handleResultClickOutside);
    };
  }, [isResultMenuOpen, resultMenuRef]);

  const onResultMenuToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setTimeout(() => {
      if (resultMenuRef.current) {
        const firstElement = resultMenuRef.current.querySelector('li > button:not(:disabled)');
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
      }
    }, 0);
    setIsResultMenuOpen(!isResultMenuOpen);
  };

  function onResultMenuSelect(_event: React.MouseEvent | undefined, itemId: string | number | undefined) {
    if (typeof itemId === 'undefined') {
      return;
    }

    const selectedResult = itemId as ResultStatus;
    setResult(
      result && result.includes(selectedResult)
        ? result.filter(item => item !== selectedResult)
        : selectedResult
          ? [selectedResult, ...(result || [])]
          : []
    );
  }

  const resultToggle = (
    <MenuToggle
      ref={resultToggleRef}
      onClick={onResultMenuToggleClick}
      isExpanded={isResultMenuOpen}
      {...(result &&
        result.length > 0 && {
          badge: <Badge isRead>{result.length}</Badge>,
        })}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by result
    </MenuToggle>
  );

  const resultMenu = (
    <Menu ref={resultMenuRef} id="attribute-search-result-menu" onSelect={onResultMenuSelect} selected={result}>
      <MenuContent>
        <MenuList>
          <MenuItem hasCheckbox isSelected={result?.includes(ResultStatus.Success)} itemId={ResultStatus.Success}>
            {ResultStatus.Success}
          </MenuItem>
          <MenuItem hasCheckbox isSelected={result?.includes(ResultStatus.Failed)} itemId={ResultStatus.Failed}>
            {ResultStatus.Failed}
          </MenuItem>
          <MenuItem hasCheckbox isSelected={result?.includes(ResultStatus.Warning)} itemId={ResultStatus.Warning}>
            {ResultStatus.Warning}
          </MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const resultSelect = (
    <div ref={resultContainerRef}>
      <Popper
        trigger={resultToggle}
        triggerRef={resultToggleRef}
        popper={resultMenu}
        popperRef={resultMenuRef}
        appendTo={resultContainerRef.current || undefined}
        isVisible={isResultMenuOpen}
      />
    </div>
  );

  // Attribute selector setup
  const [activeAttributeMenu, setActiveAttributeMenu] = React.useState<AttributeMenuOption>('Account');
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

  const attributeToggle = (
    <MenuToggle
      ref={attributeToggleRef}
      onClick={onAttributeToggleClick}
      isExpanded={isAttributeMenuOpen}
      icon={<FilterIcon />}
    >
      {activeAttributeMenu}
    </MenuToggle>
  );

  // Only show Status option in attribute menu for active view
  const attributeMenu = (
    <Menu
      ref={attributeMenuRef}
      onSelect={(_ev, itemId) => {
        const selected = itemId?.toString() as AttributeMenuOption;
        setActiveAttributeMenu(selected);
        setIsAttributeMenuOpen(!isAttributeMenuOpen);
      }}
    >
      <MenuContent>
        <MenuList>
          <MenuItem itemId="Account">Account</MenuItem>
          <MenuItem itemId="Action">Action</MenuItem>
          <MenuItem itemId="Result">Result</MenuItem>
          <MenuItem itemId="Provider">Provider</MenuItem>
          <MenuItem itemId="TriggeredBy">Triggered by</MenuItem>
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
        setSearchValue('');
        setProviderSelections(null);
        setAction(null);
        setResult(null);
        setTriggeredBy('');
      }}
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>{attributeDropdown}</ToolbarItem>
            <ToolbarFilter
              labels={searchValue !== '' ? [searchValue] : []}
              deleteLabel={() => setSearchValue('')}
              deleteLabelGroup={() => setSearchValue('')}
              categoryName="Account"
              showToolbarItem={activeAttributeMenu === 'Account'}
            >
              {searchInput}
            </ToolbarFilter>
            <ToolbarFilter
              labels={triggered_by !== '' ? [triggered_by] : []}
              deleteLabel={() => setTriggeredBy('')}
              deleteLabelGroup={() => setTriggeredBy('')}
              categoryName="TriggeredBy"
              showToolbarItem={activeAttributeMenu === 'TriggeredBy'}
            >
              {triggeredByInput}
            </ToolbarFilter>
            <ToolbarFilter
              labels={result || []}
              deleteLabel={(_category, chip) => onResultMenuSelect(undefined, chip as string)}
              deleteLabelGroup={() => setResult([])}
              categoryName="Result"
              showToolbarItem={activeAttributeMenu === 'Result'}
            >
              {resultSelect}
            </ToolbarFilter>
            <ToolbarFilter
              labels={providerSelections || []}
              deleteLabel={(_category, chip) => onProviderMenuSelect(undefined, chip as string)}
              deleteLabelGroup={() => setProviderSelections([])}
              categoryName="Provider"
              showToolbarItem={activeAttributeMenu === 'Provider'}
            >
              {providerSelect}
            </ToolbarFilter>
            <ToolbarFilter
              labels={action || []}
              deleteLabel={(_category, chip) => onActionMenuSelect(undefined, chip as string)}
              deleteLabelGroup={() => setAction([])}
              categoryName="Action"
              showToolbarItem={activeAttributeMenu === 'Action'}
            >
              {actionSelect}
            </ToolbarFilter>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default AuditLogsTableToolbar;
