export function LogoMark({ size = 32, color = '#556522' }: { size?: number; color?: string }) {
  // Rounded outline "K" with a checkmark diagonal · verification concept.
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {/* vertical stem with hooked top */}
      <path
        d="M16 12h4a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3V15"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* checkmark diagonal forming the K legs */}
      <path
        d="M32 13 24 24l9 11"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={size + 10} />
      <span
        className="font-display font-bold text-ink"
        style={{ fontSize: size, letterSpacing: '-0.02em' }}
      >
        Kamp<span style={{ color: '#7c9416' }}>i</span>va
      </span>
    </div>
  )
}
