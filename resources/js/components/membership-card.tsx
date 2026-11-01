import TierBadge from '@/components/tier-badge';
import { formatBaht } from '@/lib/format';
import type { Membership } from '@/types';

/** การ์ดสถานะสมาชิก: tier ปัจจุบัน ยอดซื้อสะสม และยอดที่ต้องซื้อเพิ่มเพื่อขึ้น tier ถัดไป */
export default function MembershipCard({
    membership,
}: {
    membership: Membership;
}) {
    const { tier, total_spent, next_tier } = membership;
    const from = tier?.min_spent ?? 0;
    const progress = next_tier
        ? Math.min(
              100,
              Math.max(
                  0,
                  ((total_spent - from) / (next_tier.min_spent - from)) * 100,
              ),
          )
        : 100;

    return (
        <section className="rounded-xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">สถานะสมาชิก</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        ยอดซื้อสะสม{' '}
                        <span className="font-medium text-foreground tabular-nums">
                            {formatBaht(total_spent)}
                        </span>
                    </p>
                </div>
                {tier ? (
                    <TierBadge name={tier.name} className="px-3 py-1 text-sm" />
                ) : (
                    <span className="text-sm text-muted-foreground">
                        ยังไม่มีระดับสมาชิก
                    </span>
                )}
            </div>

            <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                aria-label="ความคืบหน้าสู่ระดับถัดไป"
            >
                <div
                    className="h-full rounded-full bg-banana"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
                {next_tier ? (
                    <>
                        ซื้ออีก{' '}
                        <span className="font-medium text-foreground tabular-nums">
                            {formatBaht(next_tier.remaining)}
                        </span>{' '}
                        เพื่อเลื่อนเป็น {next_tier.name}
                    </>
                ) : (
                    'คุณอยู่ระดับสมาชิกสูงสุดแล้ว'
                )}
            </p>
        </section>
    );
}
