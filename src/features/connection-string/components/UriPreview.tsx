'use client';

import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';

import { CopyButton } from '@/components/tool/CopyButton';

interface UriPreviewProps {
  uri: string;
  previewUri: string;
  isValid: boolean;
  hasPassword: boolean;
  isPasswordVisible: boolean;
  onTogglePassword(): void;
}

export function UriPreview({
  uri,
  previewUri,
  isValid,
  hasPassword,
  isPasswordVisible,
  onTogglePassword,
}: UriPreviewProps) {
  const ToggleIcon = isPasswordVisible ? EyeOff : Eye;

  return (
    <Stack as="section" aria-labelledby="uri-preview-title" gap="3">
      <Flex align="center" justify="space-between" gap="3" wrap="wrap">
        <Heading as="h2" id="uri-preview-title" size="md">
          Connection URI
        </Heading>
        {isValid && (
          <Flex gap="2">
            {hasPassword && (
              <Button
                size="sm"
                variant="outline"
                aria-pressed={isPasswordVisible}
                onClick={onTogglePassword}
              >
                <ToggleIcon aria-hidden="true" />
                {isPasswordVisible ? 'Hide password' : 'Show password'}
              </Button>
            )}
            <CopyButton value={uri} label="Copy URI" />
          </Flex>
        )}
      </Flex>
      <Box
        p="4"
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border"
        rounded="lg"
        minH="16"
      >
        {isValid ? (
          <Text
            as="code"
            display="block"
            fontFamily="mono"
            fontSize="sm"
            color="fg.highlight"
            wordBreak="break-all"
          >
            {previewUri}
          </Text>
        ) : (
          <Text color="fg.muted">
            Fill in the required fields (marked with *) to get a URI.
          </Text>
        )}
      </Box>
    </Stack>
  );
}
