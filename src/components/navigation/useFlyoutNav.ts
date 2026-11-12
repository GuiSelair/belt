'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { flushSync } from 'react-dom';

const CLOSE_DELAY_MS = 150;

function getPanelLinks(panel: HTMLElement | null): HTMLAnchorElement[] {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLAnchorElement>('a[href]'));
}

function getNextIndex(key: string, current: number, total: number) {
  if (key === 'ArrowDown') return (current + 1) % total;
  if (key === 'ArrowUp') return (current - 1 + total) % total;
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return null;
}

export function useFlyoutNav() {
  const [openId, setOpenId] = useState<string | null>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const lastPointerTypeRef = useRef<string | null>(null);
  const triggersRef = useRef(new Map<string, HTMLButtonElement>());
  const panelsRef = useRef(new Map<string, HTMLElement>());

  const cancelScheduledClose = useCallback(() => {
    window.clearTimeout(closeTimerRef.current);
  }, []);

  const open = useCallback(
    (id: string) => {
      cancelScheduledClose();
      setOpenId(id);
    },
    [cancelScheduledClose],
  );

  const close = useCallback(() => {
    cancelScheduledClose();
    setOpenId(null);
  }, [cancelScheduledClose]);

  useEffect(() => cancelScheduledClose, [cancelScheduledClose]);

  const focusLink = useCallback((id: string, index: number) => {
    getPanelLinks(panelsRef.current.get(id) ?? null)[index]?.focus();
  }, []);

  const openAndFocusFirst = useCallback(
    (id: string) => {
      flushSync(() => open(id));
      focusLink(id, 0);
    },
    [focusLink, open],
  );

  const closeAndFocusTrigger = useCallback(
    (id: string) => {
      close();
      triggersRef.current.get(id)?.focus();
    },
    [close],
  );

  function getItemProps(id: string) {
    return {
      onPointerEnter(event: PointerEvent) {
        if (event.pointerType === 'mouse') open(id);
      },
      onPointerLeave(event: PointerEvent) {
        if (event.pointerType !== 'mouse') return;
        cancelScheduledClose();
        closeTimerRef.current = window.setTimeout(close, CLOSE_DELAY_MS);
      },
      onBlur(event: FocusEvent<HTMLElement>) {
        const nextFocus = event.relatedTarget as Node | null;
        if (nextFocus && event.currentTarget.contains(nextFocus)) return;
        if (openId === id) close();
      },
      onKeyDown(event: KeyboardEvent) {
        if (event.key !== 'Escape' || openId !== id) return;
        event.preventDefault();
        closeAndFocusTrigger(id);
      },
    };
  }

  function getTriggerProps(id: string, panelId: string) {
    const isOpen = openId === id;
    return {
      ref(element: HTMLButtonElement | null) {
        if (element) triggersRef.current.set(id, element);
        else triggersRef.current.delete(id);
      },
      'aria-expanded': isOpen,
      'aria-controls': panelId,
      onPointerDown(event: PointerEvent) {
        lastPointerTypeRef.current = event.pointerType;
      },
      onClick() {
        const isMouseClick = lastPointerTypeRef.current === 'mouse';
        lastPointerTypeRef.current = null;
        if (isMouseClick || !isOpen) open(id);
        else close();
      },
      onKeyDown(event: KeyboardEvent) {
        if (event.key !== 'ArrowDown') return;
        event.preventDefault();
        openAndFocusFirst(id);
      },
    };
  }

  function getPanelProps(id: string, panelId: string) {
    return {
      ref(element: HTMLElement | null) {
        if (element) panelsRef.current.set(id, element);
        else panelsRef.current.delete(id);
      },
      id: panelId,
      hidden: openId !== id,
      onClick(event: MouseEvent) {
        if ((event.target as HTMLElement).closest('a')) close();
      },
      onKeyDown(event: KeyboardEvent<HTMLElement>) {
        const links = getPanelLinks(event.currentTarget);
        const current = links.indexOf(
          document.activeElement as HTMLAnchorElement,
        );
        const next = getNextIndex(event.key, current, links.length);
        if (next === null) return;
        event.preventDefault();
        links[next]?.focus();
      },
    };
  }

  return { openId, getItemProps, getTriggerProps, getPanelProps };
}
