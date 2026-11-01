import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Profile settings" />

            <section className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold">ข้อมูลส่วนตัว</h2>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    ชื่อนี้จะแสดงในรีวิวและคำสั่งซื้อของคุณ
                </p>

                <Form
                    {...ProfileController.update.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                                <Input
                                    id="name"
                                    defaultValue={auth.user?.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    className="h-11 rounded-lg bg-background"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={auth.user?.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    className="h-11 rounded-lg bg-background"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {mustVerifyEmail &&
                                auth.user?.email_verified_at === null && (
                                    <div className="rounded-lg bg-banana-soft p-3 text-sm">
                                        อีเมลนี้ยังไม่ได้ยืนยัน{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="font-medium underline underline-offset-4"
                                        >
                                            ส่งอีเมลยืนยันอีกครั้ง
                                        </Link>
                                        {status ===
                                            'verification-link-sent' && (
                                            <p className="mt-2 text-forest">
                                                ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว
                                            </p>
                                        )}
                                    </div>
                                )}

                            <Button
                                className="rounded-full px-6"
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                บันทึก
                            </Button>
                        </>
                    )}
                </Form>
            </section>

            <DeleteUser />
        </>
    );
}
