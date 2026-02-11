'use client';

import * as React from 'react';
import { Frame, PieChart, MessageCircle, Users2, FolderCodeIcon, BotMessageSquare, Bell } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
} from '@/components/ui/sidebar';
import { useAppSelector } from '@/app/store/hooks';
import { IUser } from '@/interfaces/user.interface';
import Link from 'next/link';
import { AbilityContext } from '@/app/providers/AbilityProvider';
import { Action } from '@/interfaces/policy.interface';

const data = {
    project: {
        name: 'CodeAtlas',
        subtitle: 'Admin Panel',
        logo: BotMessageSquare,
    },
    navModules: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: PieChart,
        },
        {
            id: 'User',
            title: 'Users',
            url: '/users',
            icon: Users2,
        },
        {
            id: 'Role',
            title: 'Roles & Permissions',
            url: '/roles-permissions',
            icon: Frame,
        },
        {
            id: 'Project',
            title: 'Projects',
            url: '/projects',
            icon: FolderCodeIcon,
        },
        {
            id: 'Notification',
            title: 'Notification Templates',
            url: '/notification-templates',
            icon: Bell,
        },
        {
            id: 'Chat',
            title: 'Chat',
            url: '/chat',
            icon: MessageCircle,
        },
    ],
    recentProjects: [
        {
            name: 'Design Engineering',
            url: '#',
            icon: Frame,
        },
        {
            name: 'Sales & Marketing',
            url: '#',
            icon: PieChart,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAppSelector((s) => s.auth.user) as IUser;
    const ability = React.useContext(AbilityContext);

    data.navModules = data.navModules.filter(module => ability?.can(Action.View, module.id));

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Link href="/dashboard">
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
                            <data.project.logo className="size-7" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{data.project.name}</span>
                            <span className="truncate text-xs">{data?.project?.subtitle}</span>
                        </div>
                    </SidebarMenuButton>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navModules} />
                <NavProjects projects={data.recentProjects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
