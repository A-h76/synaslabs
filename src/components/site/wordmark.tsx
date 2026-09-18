import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function Wordmark({
  className = "h-6 w-auto sm:h-7",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label={`${SITE_NAME} home`}>
      <Image
        src="/synas-wordmark.png"
        alt={SITE_NAME}
        width={475}
        height={136}
        priority={priority}
        className={`brightness-0 ${className}`}
      />
    </Link>
  );
}
