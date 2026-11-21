import { decodeJwt, type DecodedJwt, type JwtDecodeError } from './decodeJwt';
import { describeClaims, type JwtDescription } from './describeClaims';

export type InspectJwtResult =
  | { ok: true; token: DecodedJwt; description: JwtDescription }
  | { ok: false; error: JwtDecodeError };

export function inspectJwt(input: string): InspectJwtResult {
  const decoded = decodeJwt(input);
  if (!decoded.ok) return decoded;
  const { token } = decoded;
  return {
    ok: true,
    token,
    description: describeClaims(token.header, token.payload),
  };
}
