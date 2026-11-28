'use client';

import { ChalkIllustration, ChalkPath } from './ChalkIllustration';

const CONTOUR_PATHS = [
  // Main Swiss knife rounded capsule scale
  'M 90 204 Q 154 200 218 204 A 26 26 0 0 1 218 256 Q 154 260 90 256 A 26 26 0 0 1 90 204 Z',
  // Lower 3D liner rim of handle
  'M 68 244 C 75 262, 92 266, 112 266 L 208 266 C 228 266, 241 255, 244 239',
  // Spear-point main blade (top-left)
  'M 78 206 L 30 68 C 58 86, 82 126, 98 184 L 94 204',
  // Open-end wrench blade (upper-center-left)
  'M 102 203 L 120 94 C 105 84, 106 58, 124 48 L 129 66 L 141 69 L 147 52 C 160 64, 156 88, 136 96 L 116 203',
  // Inline magnifying loupe tool (upper-right)
  'M 198 204 L 224 114',
  'M 212 204 L 236 118',
  'M 240 66 A 27 27 0 1 1 239.9 66 Z',
  // Cap-lifter / flat screwdriver blade (far right)
  'M 220 205 L 274 126 L 292 138 L 280 155 C 271 149, 263 156, 268 166 L 234 210',
  // Backside helical corkscrew (bottom)
  'M 148 266 C 134 274, 154 286, 138 295 C 122 304, 144 316, 128 325 L 121 338',
  // Keyring eyelet and split ring (left end)
  'M 65 227 L 53 230 L 53 241 L 66 243',
  'M 56 237 A 14 14 0 1 0 56 247',
];

const DETAIL_PATHS = [
  // Blade fuller & nail nick
  'M 48 110 Q 56 124 61 138',
  'M 40 84 L 85 196',
  // Inner lens ring and glass reflection glints on loupe
  'M 240 73 A 20 20 0 1 1 239.9 73 Z',
  'M 230 84 L 243 76',
  'M 235 93 L 249 84',
  // Left & right pivot rivets
  'M 90 224 A 6 6 0 1 1 89.9 224 Z',
  'M 218 224 A 6 6 0 1 1 217.9 224 Z',
  // Shield crest on handle scale + { } developer emblem
  'M 140 215 L 168 215 L 168 231 C 168 241, 154 247, 154 247 C 154 247, 140 241, 140 231 Z',
  'M 150 222 C 147 222, 147 227, 145 229 C 147 231, 147 236, 150 236',
  'M 158 222 C 161 222, 161 227, 163 229 C 161 231, 161 236, 158 236',
  // Corkscrew second spiral thickness line
  'M 153 266 C 140 274, 158 286, 143 295 C 128 304, 148 316, 133 324',
  // Split ring double stroke
  'M 53 234 A 11 11 0 1 0 54 249',
];

const GUIDE_HATCH_PATHS = [
  // Chalk shading hatches along lower scale & blade bevel
  'M 96 257 L 89 264',
  'M 114 258 L 107 265',
  'M 132 259 L 125 266',
  'M 150 259 L 143 266',
  'M 168 259 L 161 266',
  'M 186 258 L 179 265',
  'M 204 257 L 197 265',
  'M 64 142 L 73 139',
  'M 70 156 L 80 152',
  'M 76 170 L 86 166',
  // Blueprint crosshair ticks near pivots
  'M 18 68 L 28 68',
  'M 23 63 L 23 73',
];

const DASHED_BLUEPRINT_ARC = 'M 32 62 A 168 168 0 0 1 288 124';

export function SwissKnifeChalk() {
  return (
    <ChalkIllustration
      name="swiss-knife"
      viewBox="0 0 320 360"
      seed={17}
      css={{
        left: {
          lg: '-2rem',
          xl: 'clamp(0.75rem, calc((100vw - 76rem) * 0.32), 11rem)',
        },
        top: { lg: '15%', xl: '14%' },
        width: {
          lg: '11.5rem',
          xl: 'clamp(14.5rem, 18vw, 19.5rem)',
        },
        height: 'auto',
        transform: 'rotate(-11deg)',
      }}
    >
      <ChalkPath d={DASHED_BLUEPRINT_ARC} variant="guide" dashed />
      {GUIDE_HATCH_PATHS.map(function renderHatch(d, index) {
        return (
          <ChalkPath
            key={d}
            d={d}
            variant="guide"
            delay={`${0.45 + index * 0.02}s`}
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
            delay={`${0.25 + index * 0.04}s`}
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
            delay={`${0.1 + index * 0.05}s`}
            duration="0.85s"
          />
        );
      })}
    </ChalkIllustration>
  );
}
