/** لوگوی اپ: کلاه سربازی کوچولو با یه ستاره */
export default function Helmet({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#FFC83D" />
      <path d="M12 40c0-15 9-26 20-26s20 11 20 26z" fill="#4E8A3E" />
      <path d="M18 30c2-7 7-11 14-12" stroke="#7FB46A" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="8" y="38" width="48" height="8" rx="4" fill="#3A6B2E" />
      <path d="M32 21l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="#FFE27A" />
    </svg>
  );
}
