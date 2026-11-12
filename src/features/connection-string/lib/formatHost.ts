export function isIpv6(host: string) {
  return host.includes(':');
}

export function formatHost(rawHost: string) {
  const host = rawHost.trim();
  if (!isIpv6(host) || host.startsWith('[')) return host;
  return `[${host}]`;
}
