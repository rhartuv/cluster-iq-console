import * as React from 'react';
import {
  Page,
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadLogo,
  MastheadBrand,
  MastheadContent,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Dropdown,
  DropdownItem,
  MenuToggle,
  ToolbarGroup,
  DropdownList,
} from '@patternfly/react-core';

import { QuestionCircleIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import SidebarNavigation from './SidebarNavigation';
import { useUser } from '../Contexts/UserContext';
import { NavLink } from 'react-router-dom';
import AboutModalComponent from './AboutModal';
import { REPOSITORY_URL } from '@app/constants';
import faviconImg from '../../assets/favicon.png';
interface IAppLayout {
  children: React.ReactNode;
}

const PF_BREAKPOINT_XL = 1200;

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const { userEmail, setUserEmail } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = React.useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const isDesktop = () => window.innerWidth >= PF_BREAKPOINT_XL;
  const previousDesktopState = React.useRef(isDesktop());

  const defaultHelpLinks = [
    {
      label: 'Documentation',
      onClick: () => window.open(REPOSITORY_URL, '_blank'),
      isExternal: true,
    },
    {
      label: 'About',
      onClick: () => setIsAboutModalOpen(true),
    },
  ];

  const helpDropdownItems = defaultHelpLinks.map(link => {
    const content = (
      <>
        {link.label}
        {link.isExternal && (
          <span style={{ marginLeft: 'var(--pf-t--global--spacer--sm)', verticalAlign: 'middle' }}>
            {' '}
            <ExternalLinkAltIcon />
          </span>
        )}
      </>
    );
    return (
      <DropdownItem key={link.label} onClick={link.onClick} component="button">
        {content}
      </DropdownItem>
    );
  });
  // Reference https://github.com/openshift/oauth-proxy?tab=readme-ov-file#endpoint-documentation
  const handleLogout = () => {
    setUserEmail(null);
    window.location.href = '/oauth/sign_in';
  };

  const onUserDropdownToggle = () => {
    setIsUserDropdownOpen(prev => !prev);
  };

  const onUserDropdownSelect = () => {
    setIsUserDropdownOpen(false);
  };

  const userDropdownItems = [
    <DropdownItem key="logout" onClick={handleLogout}>
      Log out
    </DropdownItem>,
  ];

  const onResize = React.useCallback(() => {
    const desktop = isDesktop();
    if (desktop !== previousDesktopState.current) {
      setIsSidebarOpen(false);
    } else if (desktop) {
      setIsSidebarOpen(true);
    }
    previousDesktopState.current = desktop;
  }, []);

  const onSidebarToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };

  React.useEffect(() => {
    window.addEventListener('resize', onResize);
    if (isDesktop()) {
      setIsSidebarOpen(true);
    }
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);

  const headerToolbar = (
    <Toolbar id="toolbar" isFullHeight isStatic style={{ width: '100%' }}>
      <ToolbarContent style={{ width: '100%' }}>
        <ToolbarGroup align={{ default: 'alignEnd' }}>
          <ToolbarItem>
            <Dropdown
              isOpen={isHelpMenuOpen}
              onOpenChange={setIsHelpMenuOpen}
              onSelect={() => setIsHelpMenuOpen(false)}
              popperProps={{
                position: 'right',
              }}
              toggle={toggleRef => (
                <MenuToggle
                  ref={toggleRef}
                  aria-label="Help dropdown"
                  variant="plain"
                  onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
                  isExpanded={isHelpMenuOpen}
                  style={{ color: '#ffffff', fontSize: '1em' }}
                >
                  <QuestionCircleIcon style={{ color: '#ffffff', fontSize: '1.5em' }} />
                </MenuToggle>
              )}
            >
              <DropdownList>{helpDropdownItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isOpen={isUserDropdownOpen}
              onOpenChange={setIsUserDropdownOpen}
              onSelect={onUserDropdownSelect}
              toggle={toggleRef => (
                <MenuToggle
                  ref={toggleRef}
                  aria-label="User menu"
                  variant="plainText"
                  onClick={onUserDropdownToggle}
                  style={{
                    color: 'white',
                    padding: '0 24px',
                    fontWeight: 'normal',
                    fontSize: '1.2em',
                    border: '1px solid #ffffff',
                    borderRadius: '4px',
                  }}
                >
                  {userEmail || 'User'}
                </MenuToggle>
              )}
            >
              <DropdownList>{userDropdownItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  const header = (
    <Masthead style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton
            isHamburgerButton
            variant="plain"
            aria-label="Global navigation"
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={onSidebarToggle}
            id="vertical-nav-toggle"
            style={{ color: '#ffffff', fontSize: '1.1em', marginTop: '0.5em' }}
          ></PageToggleButton>
        </MastheadToggle>
        <MastheadBrand data-codemods>
          <MastheadLogo
            data-codemods
            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '2.1em' }}
          >
            <img src={faviconImg} alt="Red Hat" style={{ height: '4em', width: 'auto', marginTop: '0.5em' }} />
            <NavLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
              ClusterIQ
            </NavLink>
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent style={{ width: '100%', color: '#ffffff' }}>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar
      isSidebarOpen={isSidebarOpen}
      id="vertical-sidebar"
      style={{ backgroundColor: '#2d2d2d', color: '#ffffff' }}
    >
      <PageSidebarBody style={{ backgroundColor: '#2d2d2d', color: '#ffffff' }}>
        <SidebarNavigation />
      </PageSidebarBody>
    </PageSidebar>
  );

  const pageId = 'primary-app-container';

  return (
    <>
      <Page masthead={header} sidebar={sidebar} mainContainerId={pageId}>
        {children}
      </Page>
      <AboutModalComponent isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)}></AboutModalComponent>
    </>
  );
};

export { AppLayout };
