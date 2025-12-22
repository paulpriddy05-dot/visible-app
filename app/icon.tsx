import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

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
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a', // slate-900 matches your text
          fontWeight: 700,
          borderRadius: '20%', // Optional: Adds slight rounded corners
          fontFamily: 'Times New Roman, serif', // Matches your Serif branding
        }}
      >
        V
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}