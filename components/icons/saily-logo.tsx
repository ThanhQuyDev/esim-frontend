import Image from "next/image";

export function SailyLogo({ className = "w-[100px] lg:w-[140px]" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="esim.vn"
      width={140}
      height={34}
      sizes="(min-width: 1024px) 140px, 100px"
      priority
      className={className}
      style={{ objectFit: "contain", height: "auto" }}
    />
  );
}
