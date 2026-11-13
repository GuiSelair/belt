import { Box, Container, Flex, IconButton } from '@chakra-ui/react';

import { GithubIcon } from '@/components/icons/GithubIcon';
import { siteConfig } from '@/config/site';

export function AppFooter() {
  return (
    <Box as="footer" color="fg">
      <Container maxW="7xl">
        <Flex justify="flex-end" align="center" minH="14">
          <IconButton
            asChild
            variant="ghost"
            size="sm"
            color="fg"
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <a
              href={siteConfig.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${siteConfig.name} on GitHub (opens in a new tab)`}
            >
              <GithubIcon />
            </a>
          </IconButton>
        </Flex>
      </Container>
    </Box>
  );
}
