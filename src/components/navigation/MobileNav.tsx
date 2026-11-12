'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  CloseButton,
  Drawer,
  Heading,
  IconButton,
  Portal,
  Stack,
  chakra,
} from '@chakra-ui/react';
import { Menu } from 'lucide-react';

import type { NavSection } from '@/registry';

import { NavLinkItem } from './NavLinkItem';

interface MobileNavProps {
  sections: NavSection[];
}

export function MobileNav({ sections }: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function handleOpenChange(details: Drawer.OpenChangeDetails) {
    setIsOpen(details.open);
  }

  function closeDrawer() {
    setIsOpen(false);
  }

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      placement="end"
      size="xs"
    >
      <Drawer.Trigger asChild>
        <IconButton
          aria-label="Open navigation"
          variant="ghost"
          color="fg"
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          <Menu aria-hidden="true" />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.panel">
            <Drawer.Header>
              <Drawer.Title>Navigation</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <chakra.nav aria-label="Main">
                <Stack gap="6">
                  {sections.map((section) => (
                    <section
                      key={section.id}
                      aria-labelledby={`drawer-${section.id}`}
                    >
                      <Heading
                        as="h2"
                        id={`drawer-${section.id}`}
                        size="xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color="fg.highlight"
                        mb="2"
                      >
                        {section.label}
                      </Heading>
                      <chakra.ul
                        listStyleType="none"
                        display="grid"
                        gap="1"
                        onClick={closeDrawer}
                      >
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <NavLinkItem
                              item={item}
                              isActive={
                                !item.external && item.href === pathname
                              }
                            />
                          </li>
                        ))}
                      </chakra.ul>
                    </section>
                  ))}
                </Stack>
              </chakra.nav>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton aria-label="Close navigation" size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
