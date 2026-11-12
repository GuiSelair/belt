'use client';

import { Box, chakra } from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';

import type { NavSection } from '@/registry';

import { NavLinkItem } from './NavLinkItem';
import type { useFlyoutNav } from './useFlyoutNav';

type FlyoutNav = ReturnType<typeof useFlyoutNav>;

interface NavFlyoutProps {
  section: NavSection;
  activeHref: string;
  align?: 'start' | 'end';
  itemProps: ReturnType<FlyoutNav['getItemProps']>;
  triggerProps: ReturnType<FlyoutNav['getTriggerProps']>;
  panelProps: ReturnType<FlyoutNav['getPanelProps']>;
}

const Trigger = chakra('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    px: '3',
    py: '2',
    rounded: 'md',
    fontWeight: 'medium',
    color: 'fg',
    cursor: 'pointer',
    borderBottomWidth: '2px',
    borderBottomColor: 'transparent',
    _hover: { bg: 'whiteAlpha.200' },
    _expanded: { bg: 'whiteAlpha.200' },
    '&[data-active]': { borderBottomColor: 'fg.highlight' },
    '& svg': { transition: 'transform 0.15s ease' },
    '&[aria-expanded=true] svg': { transform: 'rotate(180deg)' },
    _motionReduce: { '& svg': { transition: 'none' } },
  },
});

export function NavFlyout({
  section,
  activeHref,
  align = 'start',
  itemProps,
  triggerProps,
  panelProps,
}: NavFlyoutProps) {
  const hasActiveItem = section.items.some(
    (item) => !item.external && item.href === activeHref,
  );

  return (
    <Box as="li" position="relative" className="kv-nav-item" {...itemProps}>
      <Trigger
        type="button"
        data-active={hasActiveItem ? '' : undefined}
        {...triggerProps}
      >
        {section.label}
        <ChevronDown size={16} aria-hidden="true" />
      </Trigger>
      <Box
        className="kv-nav-panel"
        position="absolute"
        top="calc(100% + 0.25rem)"
        left={align === 'start' ? '0' : undefined}
        right={align === 'end' ? '0' : undefined}
        zIndex="dropdown"
        minW="xs"
        p="2"
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border"
        rounded="lg"
        boxShadow="lg"
        _motionSafe={{ animation: 'fade-in 0.15s ease-out' }}
        {...panelProps}
      >
        <chakra.ul listStyleType="none" display="grid" gap="1">
          {section.items.map((item) => (
            <li key={item.id}>
              <NavLinkItem
                item={item}
                isActive={!item.external && item.href === activeHref}
              />
            </li>
          ))}
        </chakra.ul>
      </Box>
    </Box>
  );
}
