'use client';

import { ChalkIllustration, ChalkPath } from './ChalkIllustration';

const CONTOUR_PATHS = [
  // Heavy frame belt buckle (left end)
  'M 38 98 L 78 98 Q 88 98 88 108 L 88 152 Q 88 162 78 162 L 38 162 Q 28 162 28 152 L 28 108 Q 28 98 38 98 Z',
  // Buckle inner window & locking prong
  'M 43 109 L 73 109 L 73 151 L 43 151 Z',
  'M 73 130 L 20 131',
  // Belt keeper loop next to buckle
  'M 96 103 L 110 103 L 110 157 L 96 157 Z',
  // Belt strap left segment (buckle to pouch tunnel)
  'M 74 108 L 96 108',
  'M 110 108 L 142 108',
  'M 74 152 L 96 152',
  'M 110 152 L 142 152',
  // Belt strap right segment with pointed tail
  'M 230 108 C 258 109, 282 112, 298 115 L 322 134 L 298 154 C 282 156, 258 153, 230 152',
  // Utility pouch wide belt loop & main holster body
  'M 142 98 L 230 98 L 230 154 L 244 162 L 244 270 Q 244 292 222 292 L 150 292 Q 128 292 128 270 L 128 162 L 142 154 Z',
  // 3D side gusset of tool pouch
  'M 244 168 L 255 175 L 255 268 Q 255 288 235 292',
  // Front pocket + angled flap with snap button
  'M 143 202 L 229 202 L 229 268 Q 229 278 219 278 L 153 278 Q 143 278 143 268 Z',
  'M 143 202 L 186 232 L 229 202',
  // Screwdriver handle rising from left slot of pouch
  'M 155 98 L 152 54 Q 152 40 166 40 Q 180 40 180 54 L 177 98',
  // Pliers / mini-wrench jaws peeking from right slot of pouch
  'M 196 98 L 202 64 L 194 48 L 206 44 L 212 58 L 218 46 L 228 52 L 220 68 L 214 98',
  // Belt loop + D-ring + hanging tactical carabiner (lower-left)
  'M 103 157 L 103 170 L 117 170 L 117 152',
  'M 100 170 L 120 170 A 10 10 0 0 1 100 170 Z',
  'M 108 178 C 83 183, 73 218, 81 244 C 87 260, 113 262, 119 244 C 125 224, 121 191, 108 178 Z',
];

const DETAIL_PATHS = [
  // Carabiner inner cutout & locking gate sleeve
  'M 105 191 C 90 194, 83 218, 89 238 C 93 249, 108 250, 111 238 C 115 222, 113 199, 105 191 Z',
  'M 114 202 L 122 204 L 120 224 L 112 222 Z',
  // Belt adjustment holes on right strap tail
  'M 254 128 A 3.5 3.5 0 1 1 253.9 128 Z',
  'M 270 129 A 3.5 3.5 0 1 1 269.9 129 Z',
  'M 286 130 A 3.5 3.5 0 1 1 285.9 130 Z',
  'M 301 131 A 3.2 3.2 0 1 1 300.9 131 Z',
  // Pouch rivets & pocket snap button
  'M 154 146 A 3.5 3.5 0 1 1 153.9 146 Z',
  'M 218 146 A 3.5 3.5 0 1 1 217.9 146 Z',
  'M 186 216 A 4.5 4.5 0 1 1 185.9 216 Z',
  // Screwdriver grip flutes
  'M 159 54 L 159 88',
  'M 166 52 L 166 90',
  'M 173 54 L 173 88',
  'M 153 62 L 179 62',
  // Subtle </> stitched badge on front pocket
  'M 173 248 L 166 254 L 173 260',
  'M 189 246 L 183 262',
  'M 199 248 L 206 254 L 199 260',
];

const STITCH_DASHED_PATHS = [
  // Top and bottom strap stitching
  'M 113 114 L 140 114',
  'M 113 146 L 140 146',
  'M 233 114 L 295 120',
  'M 233 146 L 295 148',
  // Pouch perimeter stitching
  'M 136 166 L 136 268 Q 136 284 152 284 L 220 284 Q 236 284 236 268 L 236 166',
  // Blueprint baseline guide
  'M 26 306 L 266 306',
];

const GUIDE_HATCH_PATHS = [
  // Buckle metallic sheen & pouch gusset chalk shading
  'M 32 106 L 40 99',
  'M 30 118 L 41 108',
  'M 75 156 L 86 146',
  'M 245 186 L 254 192',
  'M 245 204 L 254 210',
  'M 245 222 L 254 228',
  'M 245 240 L 254 246',
  'M 245 258 L 254 264',
  // Blueprint corner ticks
  'M 26 301 L 26 311',
  'M 266 301 L 266 311',
];

export function UtilityBeltChalk() {
  return (
    <ChalkIllustration
      name="utility-belt"
      viewBox="0 0 340 360"
      seed={31}
      css={{
        right: {
          lg: '-2rem',
          xl: 'clamp(0.75rem, calc((100vw - 76rem) * 0.32), 11rem)',
        },
        bottom: { lg: '10%', xl: '11%' },
        width: {
          lg: '12rem',
          xl: 'clamp(15rem, 18.5vw, 20rem)',
        },
        height: 'auto',
        transform: 'rotate(9deg)',
      }}
    >
      {STITCH_DASHED_PATHS.map(function renderStitch(d) {
        return <ChalkPath key={d} d={d} variant="guide" dashed />;
      })}
      {GUIDE_HATCH_PATHS.map(function renderHatch(d, index) {
        return (
          <ChalkPath
            key={d}
            d={d}
            variant="guide"
            delay={`${0.5 + index * 0.02}s`}
            duration="0.4s"
          />
        );
      })}
      {DETAIL_PATHS.map(function renderDetail(d, index) {
        return (
          <ChalkPath
            key={d}
            d={d}
            variant="detail"
            delay={`${0.3 + index * 0.04}s`}
            duration="0.65s"
          />
        );
      })}
      {CONTOUR_PATHS.map(function renderContour(d, index) {
        return (
          <ChalkPath
            key={d}
            d={d}
            variant="contour"
            delay={`${0.15 + index * 0.04}s`}
            duration="0.85s"
          />
        );
      })}
    </ChalkIllustration>
  );
}
