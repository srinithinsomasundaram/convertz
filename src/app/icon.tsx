import { ImageResponse } from 'next/og'
 
// Route segment config
// export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '10px',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5.75 8.25h7.5" />
          <path d="m11.75 5.75 5 2.5-5 2.5" />
          <path d="M18.25 15.75h-7.5" />
          <path d="m12.25 13.25-5 2.5 5 2.5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
