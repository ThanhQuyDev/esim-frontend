export function SailyLogo({ className = "w-[57px] lg:w-[78px]" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Esim.vn"
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
