import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <p className="mb-4 rounded-lg bg-forest-soft px-3 py-2 text-sm text-forest">
                    {status}
                </p>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="h-11 rounded-lg bg-background"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">รหัสผ่าน</Label>
                                {canResetPassword && (
                                    <Link
                                        href={request()}
                                        tabIndex={5}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        ลืมรหัสผ่าน?
                                    </Link>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="รหัสผ่าน"
                                className="h-11 rounded-lg bg-background"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                            />
                            จดจำการเข้าสู่ระบบ
                        </label>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full rounded-full"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            เข้าสู่ระบบ
                        </Button>

                        <p className="border-t pt-5 text-center text-sm text-muted-foreground">
                            ยังไม่มีบัญชี?{' '}
                            <Link
                                href={register()}
                                tabIndex={5}
                                className="font-medium text-foreground hover:underline"
                            >
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'เข้าสู่ระบบ',
    description: 'ยินดีต้อนรับกลับมา กรอกอีเมลและรหัสผ่านเพื่อสั่งซื้อต่อ',
};
