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

export function HomeHero() {
  const jsonBeautify = getTool('json-beautify');
  const xmlToXsd = getTool('xml-to-xsd');

  return (
    <Box
      as="section"
      aria-labelledby="home-title"
      data-home-hero=""
      display="grid"
      placeItems="center"
      flex="1"
      py="16"
    >
      <Container maxW="4xl" textAlign="center">
        <Stack gap="8" align="center">
          <Heading
            as="h1"
            id="home-title"
            fontFamily="brand"
            fontWeight="black"
            color="fg.highlight"
            fontSize={{ base: '7xl', md: '9xl' }}
            lineHeight="1"
            letterSpacing="tight"
          >
            Belt
          </Heading>
          <Text fontSize={{ base: 'lg', md: '2xl' }} color="fg" maxW="2xl">
            The{' '}
            <ScribbleCircle>
              <Text as="strong" color="fg.highlight" fontWeight="bold">
                Swiss army knife
              </Text>
            </ScribbleCircle>{' '}
            for developers — beautify, validate and transform data right in your
            browser.
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
      </Container>
    </Box>
  );
}
