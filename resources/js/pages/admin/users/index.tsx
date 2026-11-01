import { Head, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import NativeSelect from '@/components/admin/native-select';
import PageHeader from '@/components/admin/page-header';
import Pagination from '@/components/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { formatBaht, formatDate } from '@/lib/format';
import { dashboard } from '@/routes/admin';
import { index, update } from '@/routes/admin/users';
import type { AdminUser, Paginated, TierOption } from '@/types';

type Filters = { search: string; tier_id: number | null };

type Props = {
    users: Paginated<AdminUser>;
    tiers: TierOption[];
    filters: Filters;
};

export default function AdminUsersIndex({ users, tiers, filters }: Props) {
    const { auth } = usePage().props;

    const applyFilters = (next: Filters) =>
        router.get(
            index.url(),
            {
                ...(next.search && { search: next.search }),
                ...(next.tier_id && { tier_id: next.tier_id }),
            },
            { preserveState: true, replace: true },
        );

    const save = (
        user: AdminUser,
        data: Partial<Pick<AdminUser, 'tier_id' | 'is_admin'>>,
    ) =>
        router.patch(update.url(user.user_id), data, {
            preserveScroll: true,
            preserveState: true,
        });

    return (
        <>
            <Head title="Members" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="สมาชิก"
                    description={`ทั้งหมด ${users.total} คน เรียงตามยอดซื้อสะสม`}
                />

                <div className="flex flex-wrap items-center gap-3">
                    <form
                        className="relative w-full max-w-xs"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const value = new FormData(e.currentTarget).get(
                                'search',
                            );
                            applyFilters({
                                ...filters,
                                search:
                                    typeof value === 'string'
                                        ? value.trim()
                                        : '',
                            });
                        }}
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="search"
                            type="search"
                            defaultValue={filters.search}
                            placeholder="ชื่อ อีเมล หรือเบอร์โทร"
                            className="pl-9"
                        />
                    </form>
                    <NativeSelect
                        aria-label="กรองตาม tier"
                        value={filters.tier_id ?? ''}
                        onChange={(e) =>
                            applyFilters({
                                ...filters,
                                tier_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                            })
                        }
                    >
                        <option value="">ทุก tier</option>
                        {tiers.map((tier) => (
                            <option key={tier.tier_id} value={tier.tier_id}>
                                {tier.name}
                            </option>
                        ))}
                    </NativeSelect>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    สมาชิก
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    เบอร์โทร
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    ออเดอร์
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    ยอดซื้อสะสม
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Tier
                                </th>
                                <th className="px-4 py-3 text-center font-medium">
                                    Admin
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        ไม่พบสมาชิก
                                    </td>
                                </tr>
                            )}
                            {users.data.map((user) => {
                                const isMe =
                                    user.user_id === auth.user?.user_id;

                                return (
                                    <tr key={user.user_id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {user.name}
                                                {isMe && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        (คุณ)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.email}
                                                {user.created_at &&
                                                    ` · สมัคร ${formatDate(user.created_at)}`}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {user.phone ?? '–'}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {user.orders_count}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                                            {formatBaht(user.total_spent)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <NativeSelect
                                                aria-label={`Tier ของ ${user.name}`}
                                                value={user.tier_id ?? ''}
                                                onChange={(e) =>
                                                    save(user, {
                                                        tier_id: e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    })
                                                }
                                                className="h-8"
                                            >
                                                <option value="">ไม่มี</option>
                                                {tiers.map((tier) => (
                                                    <option
                                                        key={tier.tier_id}
                                                        value={tier.tier_id}
                                                    >
                                                        {tier.name}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Checkbox
                                                aria-label={`สิทธิ์ admin ของ ${user.name}`}
                                                checked={user.is_admin}
                                                // ถอดสิทธิ์ admin ของตัวเองไม่ได้
                                                disabled={isMe}
                                                onCheckedChange={(checked) =>
                                                    save(user, {
                                                        is_admin:
                                                            checked === true,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination paginator={users} />
            </div>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'สมาชิก', href: index() },
    ],
};
