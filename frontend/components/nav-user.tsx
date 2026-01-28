'use client';

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles, UserCog } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useAppDispatch } from '@/app/store/hooks';
import { clearUser, setUser } from '@/app/store/authSlice';
import { useRouter } from 'next/navigation';
import { IUser } from '@/interfaces/user.interface';
import { logoutApi, switchUserRoleApi } from '@/app/utils/apis/auth-api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { safeAsync } from '@/app/utils/safeAsync';

export function NavUser({ user }: { user: IUser }) {
    const { isMobile } = useSidebar();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);

    const handleLogout = async () => {
        await safeAsync(async () => logoutApi());
        dispatch(clearUser());
        router.push('/login');
    };

    const handleSwitchRole = async (roleId: string) => {
        const userWithNewRole = await safeAsync(async () => switchUserRoleApi(roleId))
        if(userWithNewRole) {
            router.push('/login');
            dispatch(setUser(userWithNewRole))
            setIsRolesDialogOpen(false);
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.profile_image} alt={user?.full_name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.full_name}</span>
                                <span className="truncate text-xs">{user?.active_role?.role_display_name}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.profile_image} alt={user?.full_name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user?.full_name}</span>
                                    <span className="truncate text-xs">{user?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => router.push('/account')}>
                                <BadgeCheck />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsRolesDialogOpen(true)}>
                                <UserCog />
                                Switch Role
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="text-red-600" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>

            <Dialog open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>Switch Role</DialogTitle>
                        <DialogDescription>
                            Select a role to switch to. Your current role is {user?.active_role?.role_display_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                        {user?.roles?.map((role: any) => (
                            <div
                                key={role._id}
                                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${role._id === user?.active_role?._id ? 'bg-accent border-primary' : ''
                                    }`}
                                onClick={() => handleSwitchRole(role._id)}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{role.role_display_name}</span>
                                        {role._id === user?.active_role?._id && (
                                            <Badge variant="secondary" className="text-xs">Active</Badge>
                                        )}
                                    </div>
                                    {role.role_description && (
                                        <span className="text-sm text-muted-foreground">{role.role_description}</span>
                                    )}
                                </div>
                                {role._id !== user?.active_role?._id && (
                                    <Button variant="outline" size="sm">
                                        Switch
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarMenu>
    );
}
