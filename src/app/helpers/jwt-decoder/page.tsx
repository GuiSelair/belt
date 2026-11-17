import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { JwtDecoderScreen } from '@/features/jwt/JwtDecoderScreen';

export const metadata = buildToolMetadata('jwt-decoder');

export default function JwtDecoderPage() {
  return (
    <ToolPage toolId="jwt-decoder">
      <JwtDecoderScreen />
    </ToolPage>
  );
}
