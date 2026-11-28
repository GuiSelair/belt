export type StringFormat =
  'date-time' | 'date' | 'time' | 'email' | 'uri' | 'uuid' | 'ipv4';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/i;
const DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URI = /^[a-z][a-z\d+.-]*:\/\/[^\s]+$/i;
const UUID =
  /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const IPV4_OCTET = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

function isCalendarDate(value: string) {
  const datePart = value.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().startsWith(datePart)
  );
}

function isIpv4(value: string) {
  const octets = value.split('.');
  return octets.length === 4 && octets.every((octet) => IPV4_OCTET.test(octet));
}

/** Formats from the JSON Schema vocabulary that a sample value clearly has. */
export function detectStringFormat(value: string): StringFormat | null {
  if (DATE_TIME.test(value) && isCalendarDate(value)) return 'date-time';
  if (DATE.test(value) && isCalendarDate(value)) return 'date';
  if (TIME.test(value)) return 'time';
  if (UUID.test(value)) return 'uuid';
  if (isIpv4(value)) return 'ipv4';
  if (EMAIL.test(value)) return 'email';
  if (URI.test(value)) return 'uri';
  return null;
}
