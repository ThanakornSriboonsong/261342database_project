import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

const fieldClass = 'h-11 rounded-lg bg-background';

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="ชื่อที่ใช้แสดงในรีวิวและคำสั่งซื้อ"
                                className={fieldClass}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                placeholder="you@example.com"
                                className={fieldClass}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <PasswordInput
                                id="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                placeholder="ตั้งรหัสผ่าน"
                                passwordrules={passwordRules}
                                className={fieldClass}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                ยืนยันรหัสผ่าน
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                placeholder="กรอกรหัสผ่านอีกครั้ง"
                                passwordrules={passwordRules}
                                className={fieldClass}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full rounded-full"
                            tabIndex={5}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            สมัครสมาชิก
                        </Button>

                        <p className="border-t pt-5 text-center text-sm text-muted-foreground">
                            มีบัญชีอยู่แล้ว?{' '}
                            <Link
                                href={login()}
                                tabIndex={6}
                                className="font-medium text-foreground hover:underline"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'สมัครสมาชิก',
    description: 'สร้างบัญชีเพื่อสั่งซื้อ เก็บ Wishlist และรับโค้ดส่วนลดสมาชิก',
};
