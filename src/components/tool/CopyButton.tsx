'use client';

import { Button, VisuallyHidden } from '@chakra-ui/react';
import { Check, Copy, TriangleAlert } from 'lucide-react';

import { useCopyToClipboard, type CopyStatus } from '@/lib/useCopyToClipboard';

interface CopyButtonProps {
  value: string;
  label?: string;
  disabled?: boolean;
}

const announcements: Record<CopyStatus, string> = {
  idle: '',
  copied: 'Copied to clipboard',
  error: 'Copy failed — select the text and copy it manually',
};

function CopyIcon({ status }: { status: CopyStatus }) {
  if (status === 'copied') return <Check aria-hidden="true" />;
  if (status === 'error') return <TriangleAlert aria-hidden="true" />;
  return <Copy aria-hidden="true" />;
}

export function CopyButton({
  value,
  label = 'Copy',
  disabled = false,
}: CopyButtonProps) {
  const { copy, status } = useCopyToClipboard();
  const buttonText = {
    idle: label,
    copied: 'Copied',
    error: 'Copy failed',
  }[status];

  function handleClick() {
    void copy(value);
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        colorPalette={status === 'error' ? 'red' : undefined}
        onClick={handleClick}
        disabled={disabled || value.length === 0}
      >
        <CopyIcon status={status} />
        {buttonText}
      </Button>
      <VisuallyHidden aria-live="polite">
        {announcements[status]}
      </VisuallyHidden>
    </>
  );
}
