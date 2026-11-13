import NextLink from 'next/link';
import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ArrowRight } from 'lucide-react';

import { getTool } from '@/registry';

import { ScribbleCircle } from './ScribbleCircle';

const GRID_LINES =
  'linear-gradient(to right, {colors.whiteAlpha.200} 1px, transparent 1px), linear-gradient(to bottom, {colors.whiteAlpha.200} 1px, transparent 1px)';

export function HomeHero() {
  const jsonBeautify = getTool('json-beautify');
  const xmlToXsd = getTool('xml-to-xsd');

  return (
    <Box
      as="section"
      aria-labelledby="home-title"
      display="grid"
      minH="calc(100dvh - 4rem)"
      py={{ base: '6', md: '10' }}
      bg="bg"
    >
      <Container maxW="7xl" display="grid">
        <Box
          display="grid"
          placeItems="center"
          px={{ base: '6', md: '12' }}
          py={{ base: '16', md: '24' }}
          rounded="3xl"
          bg="bg.brand"
          bgImage={GRID_LINES}
          bgSize="4rem 4rem"
          backgroundPosition="center"
          textAlign="center"
        >
          <Stack gap="8" align="center" maxW="4xl">
            <Heading
              as="h1"
              id="home-title"
              fontFamily="brand"
              fontWeight="normal"
              fontSize={{ base: '6xl', md: '9xl' }}
              lineHeight="1.1"
              transform="rotate(-3deg)"
            >
              Kanivete
            </Heading>
            <Text fontSize={{ base: 'lg', md: '2xl' }} color="fg" maxW="2xl">
              The{' '}
              <ScribbleCircle>
                <Text as="strong" color="fg.highlight" fontWeight="bold">
                  Swiss army knife
                </Text>
              </ScribbleCircle>{' '}
              for developers — beautify, validate and transform data right in
              your browser.
            </Text>
            <HStack gap="4" wrap="wrap" justify="center">
              <Button asChild size="xl" colorPalette="accent" rounded="full">
                <NextLink href={jsonBeautify.href}>
                  {jsonBeautify.name}
                  <ArrowRight aria-hidden="true" />
                </NextLink>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                rounded="full"
                color="fg"
                borderColor="fg"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                <NextLink href={xmlToXsd.href}>
                  {xmlToXsd.name}
                  <ArrowRight aria-hidden="true" />
                </NextLink>
              </Button>
            </HStack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
