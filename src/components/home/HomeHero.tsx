import NextLink from 'next/link';
import {
  Badge,
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import { getTool } from '@/registry';

import { HeroArtifacts } from './HeroArtifacts';
import { ScribbleCircle } from './ScribbleCircle';

export function HomeHero() {
  const jsonBeautify = getTool('json-beautify');
  const xmlToXsd = getTool('xml-to-xsd');

  return (
    <Box
      as="section"
      aria-labelledby="home-title"
      display="grid"
      placeItems="center"
      minH="calc(100dvh - 4rem)"
      py="16"
      bg="bg.brand"
      overflow="hidden"
    >
      <Container maxW="4xl" textAlign="center" position="relative" py="12">
        <HeroArtifacts />
        <Stack gap="8" align="center" position="relative">
          <Badge
            size="lg"
            variant="outline"
            color="fg"
            borderColor="whiteAlpha.600"
            rounded="full"
            px="3"
          >
            <ShieldCheck size={16} aria-hidden="true" />
            100% in your browser — nothing you paste leaves your machine
          </Badge>
          <Heading
            as="h1"
            id="home-title"
            fontFamily="brand"
            fontWeight="normal"
            fontSize={{ base: '6xl', md: '8xl' }}
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
