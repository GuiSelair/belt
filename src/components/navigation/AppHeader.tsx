import { Box, Container, Flex } from '@chakra-ui/react';

import { navSections } from '@/registry';

import { BrandLogo } from './BrandLogo';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';

export function AppHeader() {
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg"
      color="fg"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Container maxW="7xl">
        <Flex align="center" gap="6" minH="16">
          <BrandLogo />
          <Box display={{ base: 'none', md: 'flex' }} flex="1">
            <DesktopNav sections={navSections} />
          </Box>
          <Box display={{ base: 'block', md: 'none' }} ms="auto">
            <MobileNav sections={navSections} />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
