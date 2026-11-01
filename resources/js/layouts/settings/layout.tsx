import { Link } from '@inertiajs/react';
import { Palette, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';

const tabs = [
    { title: 'ข้อมูลส่วนตัว', href: editProfile(), icon: UserRound },
    { title: 'การแสดงผล', href: editAppearance(), icon: Palette },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <>
            <h1 className="text-3xl font-semibold tracking-tight">ตั้งค่าบัญชี</h1>
            <p className="mt-1 mb-6 text-muted-foreground">
                จัดการข้อมูลส่วนตัวและการแสดงผลของเว็บไซต์
            </p>

            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <nav
                    aria-label="Settings"
                    className="flex h-fit gap-1 rounded-xl border bg-card p-2 lg:flex-col"
                >
                    {tabs.map(({ title, href, icon: Icon }) => (
                        <Link
                            key={href.url}
                            href={href}
                            className={cn(
                                'flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors lg:flex-none',
                                isCurrentOrParentUrl(href)
                                    ? 'bg-banana-soft font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Icon className="size-4" />
                            {title}
                        </Link>
                    ))}
                </nav>

                <div className="max-w-2xl space-y-6">{children}</div>
            </div>
        </>
    );
}
