'use client';

import { usePathname } from 'next/navigation';
import { Separator, chakra } from '@chakra-ui/react';

import { LINKS_SECTION_ID, type NavSection } from '@/registry';

import { NavFlyout } from './NavFlyout';
import { useFlyoutNav } from './useFlyoutNav';

interface DesktopNavProps {
  sections: NavSection[];
}

const NO_SCRIPT_FALLBACK_CSS =
  '.kv-nav-item:hover > .kv-nav-panel, .kv-nav-item:focus-within > .kv-nav-panel { display: block !important; }';

export function DesktopNav({ sections }: DesktopNavProps) {
  const pathname = usePathname();
  const { getItemProps, getTriggerProps, getPanelProps } = useFlyoutNav();

  function renderSection(section: NavSection, align: 'start' | 'end') {
    const panelId = `nav-panel-${section.id}`;
    return (
      <NavFlyout
        key={section.id}
        section={section}
        activeHref={pathname}
        align={align}
        itemProps={getItemProps(section.id)}
        triggerProps={getTriggerProps(section.id, panelId)}
        panelProps={getPanelProps(section.id, panelId)}
      />
    );
  }

  const toolSections = sections.filter(
    (section) => section.id !== LINKS_SECTION_ID,
  );
  const linksSection = sections.find(
    (section) => section.id === LINKS_SECTION_ID,
  );

  return (
    <chakra.nav
      aria-label="Main"
      display="flex"
      alignItems="center"
      flex="1"
      gap="2"
    >
      <noscript>
        <style>{NO_SCRIPT_FALLBACK_CSS}</style>
      </noscript>
      <chakra.ul listStyleType="none" display="flex" gap="1">
        {toolSections.map((section) => renderSection(section, 'start'))}
      </chakra.ul>
      {linksSection && (
        <>
          <Separator
            orientation="vertical"
            height="6"
            ms="auto"
            borderColor="whiteAlpha.500"
          />
          <chakra.ul listStyleType="none" display="flex">
            {renderSection(linksSection, 'end')}
          </chakra.ul>
        </>
      )}
    </chakra.nav>
  );
}
