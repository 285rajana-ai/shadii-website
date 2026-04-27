import Link from "next/link";

interface BrandMarkProps {
    compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
    return (
        <Link href="/" className="brand-mark group inline-flex items-center gap-3" aria-label="Shadii.pk home">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/12 bg-[linear-gradient(145deg,#2e1219,#7a263a_55%,#e0b562)] shadow-[0_16px_40px_rgba(27,12,16,0.4)]">
                <span className="font-display text-lg font-bold italic text-white">S</span>
                <span className="absolute inset-[3px] rounded-[0.95rem] border border-white/10" />
            </div>
            {!compact && (
                <span className="flex flex-col leading-none">
                    <span className="font-display text-[1.15rem] font-bold tracking-tight text-white">
                        Shadii<span className="text-[#e0b562]">.pk</span>
                    </span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/48">
                        Serious Matchmaking
                    </span>
                </span>
            )}
        </Link>
    );
}
