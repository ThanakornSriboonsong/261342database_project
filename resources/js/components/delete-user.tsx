import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <section className="flex flex-col gap-4 rounded-xl border border-red-500/30 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold">ลบบัญชี</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    ข้อมูลคำสั่งซื้อ รีวิว และ Wishlist จะถูกลบทั้งหมด และกู้คืนไม่ได้
                </p>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="shrink-0 rounded-full border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                        data-test="delete-user-button"
                    >
                        ลบบัญชี
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>ต้องการลบบัญชีใช่ไหม?</DialogTitle>
                    <DialogDescription>
                        เมื่อลบแล้ว ข้อมูลทั้งหมดของบัญชีนี้จะหายถาวร กรอกรหัสผ่านเพื่อยืนยัน
                    </DialogDescription>

                    <Form
                        {...ProfileController.destroy.form()}
                        options={{ preserveScroll: true }}
                        onError={() => passwordInput.current?.focus()}
                        resetOnSuccess
                        className="space-y-6"
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="sr-only"
                                    >
                                        รหัสผ่าน
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        ref={passwordInput}
                                        placeholder="รหัสผ่าน"
                                        autoComplete="current-password"
                                        className="h-11 rounded-lg"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button
                                            variant="secondary"
                                            className="rounded-full"
                                            onClick={() =>
                                                resetAndClearErrors()
                                            }
                                        >
                                            ยกเลิก
                                        </Button>
                                    </DialogClose>

                                    <Button
                                        variant="destructive"
                                        className="rounded-full"
                                        disabled={processing}
                                        asChild
                                    >
                                        <button
                                            type="submit"
                                            data-test="confirm-delete-user-button"
                                        >
                                            ลบบัญชีถาวร
                                        </button>
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
