import NextLink from 'next/link';
import { Link } from '@chakra-ui/react';

export function BrandLogo() {
  return (
    <Link
      asChild
      color="fg"
      fontFamily="brand"
      fontSize="2xl"
      lineHeight="1"
      textDecoration="none"
      _hover={{ color: 'fg.highlight', textDecoration: 'none' }}
    >
      <NextLink href="/">Kanivete</NextLink>
    </Link>
  );
}
