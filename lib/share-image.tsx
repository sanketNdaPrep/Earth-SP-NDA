import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function ShareImage({ title, subtitle }: { title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0a1128, #101b3b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <path d="M32 4 56 13v18c0 15-10 25-24 29C18 56 8 46 8 31V13z" fill="#34d399" />
            <path
              d="M32 17l4 9 10 1-7.5 6.5 2.3 9.8L32 38l-8.8 5.3 2.3-9.8L18 27l10-1z"
              fill="#e9bb4e"
            />
          </svg>
          <span style={{ fontSize: '32px', fontWeight: 600, color: '#f8fafc', marginLeft: '20px' }}>
            EARTH SP NDA
          </span>
        </div>
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '20px',
            maxWidth: '800px',
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: '32px', color: '#94a3b8', maxWidth: '800px' }}>
          {subtitle}
        </p>
      </div>
    ),
    { ...size }
  );
}