"use client"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { Input } from "@/components/ui/input";
import { IUser } from "@/interfaces/user.interface";
import { Label } from "@radix-ui/react-label";
import Image from "next/image";
import * as React from "react";
import { updatePersonalInfoApi, verifyEmailApi, changeEmailApi } from "@/app/utils/apis/account-api";
import { setUser } from "@/app/store/authSlice";
import { showErrorToast } from "@/app/utils/error-handler";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Lock,
    KeyRound,
    ShieldCheck,
} from "lucide-react";

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

function IconInput({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType }) {
    return (
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" {...props} />
        </div>
    )
}

export default function AccountPage() {
    const user = useAppSelector((s) => s.auth.user) as IUser;
    const dispatch = useAppDispatch();

    const [fullName, setFullName] = React.useState(user?.full_name || "");
    const [email, setEmail] = React.useState(user?.email || "");
    const [showEmailModal, setShowEmailModal] = React.useState(false);
    const [newEmail, setNewEmail] = React.useState("");
    const [modalStep, setModalStep] = React.useState<'email' | 'otp'>('email'); // Track modal step
    const [otp, setOtp] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [oldPassword, setOldPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [profileImage, setProfileImage] = React.useState<string | null>(user?.profile_image || null);
    const [errors, setErrors] = React.useState<FormErrors>({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = React.useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenEmailModal = () => {
        setNewEmail("");
        setModalStep('email');
        setShowEmailModal(true);
    };

    const handleSendOtp = async () => {
        try {
            setIsVerifyingEmail(true);
            await verifyEmailApi(newEmail);
            setModalStep('otp');
            toast.success('OTP sent to your new email address');
        } catch (error) {
            showErrorToast(error)
        } finally {
            setIsVerifyingEmail(false);
        }
    };

    const handleOtpVerify = async () => {
        try {
            setIsLoading(true);
            const updatedUser = await changeEmailApi(newEmail, Number(otp));
            dispatch(setUser(updatedUser));
            setShowEmailModal(false);
            setOtp("");
            setNewEmail("");
            setEmail(updatedUser.email);
            toast.success("Email updated successfully");
        } catch (error) {
            showErrorToast(error)
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowEmailModal(false);
        setNewEmail("");
        setOtp("");
        setModalStep('email');
    };

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!fullName.trim()) {
            newErrors.fullName = "Full name is required";
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = "Full name must be at least 2 characters";
        }

        if (password.length > 0 || confirmPassword.length > 0) {
            if (!oldPassword) {
                newErrors.password = "Current password is required to set a new password";
            } else if (oldPassword.length < 8) {
                newErrors.password = "Current password must be at least 8 characters";
            }
            if (password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }
            if (password !== confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        return newErrors;
    };

    const handleSaveChanges = async () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            setIsLoading(true);

            // Prepare update data
            const updateData: any = {};

            if (fullName !== user?.full_name) {
                updateData.full_name = fullName;
            }

            if (password && oldPassword && password === confirmPassword) {
                updateData.password = password;
                updateData.old_password = oldPassword;
            }

            // Only call API if there are changes
            if (Object.keys(updateData).length > 0) {
                const updatedUser = await updatePersonalInfoApi(updateData);
                dispatch(setUser(updatedUser));

                // Reset password fields after successful update
                setPassword("");
                setOldPassword("");
                setConfirmPassword("");
            }

            toast("Account updated successfully");
        } catch (error) {
            showErrorToast(error);
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = React.useMemo(() => {
        const nameChanged = fullName !== (user?.full_name || "");
        const passwordChanged = password.length > 0 && oldPassword.length > 0 && password === confirmPassword;

        return nameChanged || passwordChanged;
    }, [fullName, password, confirmPassword, oldPassword, user]);

    const isFormValid = React.useMemo(() => {
        const formErrors = validateForm();
        return Object.keys(formErrors).length === 0 && hasChanges;
    }, [fullName, password, confirmPassword, hasChanges]);

    React.useEffect(() => {
        const formErrors = validateForm();
        setErrors(formErrors);
    }, [fullName, password, confirmPassword, oldPassword]);

    React.useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user?.email]);

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account</h1>
                    <p className="text-muted-foreground">
                        Manage account settings and preferences.
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-6">
                <div className="grid grid-cols-[auto_1fr] gap-8">
                    {/* Profile */}
                    <div className="flex flex-col items-start space-y-4">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted">
                            {profileImage ? (
                                <Image src={profileImage} alt="Profile" fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-4xl font-semibold text-muted-foreground">
                                    {fullName.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                        </div>

                        <Label className="w-32 cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition text-center">
                            <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            Upload Photo
                        </Label>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <IconInput
                                icon={User}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input disabled value={email} className="pl-10" />
                                </div>
                                <Button onClick={handleOpenEmailModal}>
                                    Update Email
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h2 className="text-lg font-semibold">Change Password</h2>

                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <IconInput
                                    icon={KeyRound}
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <IconInput
                                        icon={Lock}
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Confirm Password</Label>
                                    <IconInput
                                        icon={ShieldCheck}
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        disabled={!isFormValid || isLoading}
                        onClick={handleSaveChanges}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
                        {modalStep === "email" ? (
                            <>
                                <h2 className="text-xl font-semibold mb-4">Update Email</h2>

                                <div className="relative mb-4">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Enter new email"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleCloseModal}
                                        disabled={isVerifyingEmail}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleSendOtp}
                                        disabled={
                                            isVerifyingEmail ||
                                            !newEmail.trim() ||
                                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
                                        }
                                    >
                                        {isVerifyingEmail ? "Sending..." : "Send OTP"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold mb-4">Verify Email</h2>

                                <div className="relative mb-4">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleCloseModal}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleOtpVerify}
                                        disabled={isLoading || otp.length !== 6}
                                    >
                                        {isLoading ? "Verifying..." : "Verify & Update"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
