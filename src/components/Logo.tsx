export function LogoMark({ size = 32 }: { size?: number; color?: string }) {
  return <img src="/brand/kampiva-mark.png" alt="Kampiva" style={{ height: size, width: 'auto' }} />
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return <img src="/brand/kampiva-logo.png" alt="Kampiva" style={{ height: size + 14, width: 'auto' }} />
}
