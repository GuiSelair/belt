import NextLink from 'next/link';
import { Box, Link } from '@chakra-ui/react';

export function BrandLogo() {
  return (
    <Link
      asChild
      display="inline-flex"
      alignItems="center"
      gap="2"
      color="fg"
      fontWeight="bold"
      fontSize="lg"
      letterSpacing="tight"
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
    >
      <NextLink href="/">
        <Box
          as="span"
          aria-hidden="true"
          display="inline-grid"
          placeItems="center"
          boxSize="8"
          rounded="md"
          bg="brand.green"
          color="navy.950"
          fontWeight="black"
        >
          K
        </Box>
        Kanivete
      </NextLink>
    </Link>
  );
}
