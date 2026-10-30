export default function UpvoteIcon({ size = 18, filled = false, style }: { size?: number; filled?: boolean; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M8.75112 16.7486H7.18776C6.37495 16.7486 5.00982 16.8366 5.00982 15.6321V10.0034C5.00982 9.60472 4.76332 9.33144 4.29927 9.33144H1.22934C0.300486 9.33144 0.949326 8.59928 1.27807 8.28544C1.60682 7.9716 4.50831 4.93374 4.50831 4.93374C4.50831 4.93374 7.90256 1.38079 8.27704 1.02335C8.65152 0.66592 8.83328 0.651912 9.22248 1.02335C9.61168 1.3948 12.9912 4.93374 12.9912 4.93374C12.9912 4.93374 15.8927 7.9716 16.2214 8.28544C16.5502 8.59928 17.199 9.33144 16.2702 9.33144H13.2002C12.7362 9.33144 12.4897 9.60472 12.4897 10.0034V15.6321C12.4897 16.8366 11.1246 16.7486 10.3118 16.7486H8.75112Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
