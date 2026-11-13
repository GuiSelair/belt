'use client';

import NextLink from 'next/link';
import { Box, Link, VisuallyHidden } from '@chakra-ui/react';
import { ExternalLink } from 'lucide-react';

import type { NavItem } from '@/registry';

interface NavLinkItemProps {
  item: NavItem;
  isActive: boolean;
}

const linkStyles = {
  display: 'block',
  width: 'full',
  px: '3',
  py: '2',
  rounded: 'md',
  borderLeftWidth: '3px',
  borderLeftColor: 'transparent',
  color: 'fg',
  textDecoration: 'none',
  _hover: { bg: 'bg.muted', textDecoration: 'none' },
  _currentPage: {
    bg: 'bg.muted',
    borderLeftColor: 'fg.highlight',
    roundedLeft: '0',
  },
} as const;

function NavLinkContent({ item }: Pick<NavLinkItemProps, 'item'>) {
  return (
    <Box
      as="span"
      display="flex"
      alignItems="center"
      gap="1.5"
      fontWeight="medium"
    >
      {item.label}
      {item.external && <ExternalLink size={14} aria-hidden="true" />}
      {item.external && <VisuallyHidden>(opens in a new tab)</VisuallyHidden>}
    </Box>
  );
}

export function NavLinkItem({ item, isActive }: NavLinkItemProps) {
  if (item.external) {
    return (
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        {...linkStyles}
      >
        <NavLinkContent item={item} />
      </Link>
    );
  }

  return (
    <Link asChild {...linkStyles}>
      <NextLink href={item.href} aria-current={isActive ? 'page' : undefined}>
        <NavLinkContent item={item} />
      </NextLink>
    </Link>
  );
}
