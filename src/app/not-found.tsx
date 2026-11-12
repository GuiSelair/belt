import NextLink from 'next/link';
import { Button, Container, Heading, Stack, Text } from '@chakra-ui/react';

export default function NotFound() {
  return (
    <Container maxW="xl" py="24">
      <Stack gap="6" align="center" textAlign="center">
        <Text fontSize="6xl" fontWeight="black" color="fg.highlight">
          404
        </Text>
        <Heading as="h1" size="2xl">
          This blade is not in the knife
        </Heading>
        <Text color="fg.muted">
          The page you are looking for does not exist. Pick a tool from the menu
          or head back home.
        </Text>
        <Button asChild colorPalette="accent" rounded="full">
          <NextLink href="/">Back to home</NextLink>
        </Button>
      </Stack>
    </Container>
  );
}
