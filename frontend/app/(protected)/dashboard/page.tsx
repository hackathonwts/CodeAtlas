'use client';

import { useAppSelector } from '@/app/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getAllUsersApi } from '@/app/utils/apis/user-api';
import { projectsListApi } from '@/app/utils/apis/projects-api';
import { IProject } from '@/interfaces/project.interface';
import { Users, FolderKanban, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const user = useAppSelector((s) => s.auth.user);
    const [stats, setStats] = useState({
        usersCount: 0,
        projectsCount: 0,
    });
    const [recentProjects, setRecentProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, projectsResponse] = await Promise.all([
                    getAllUsersApi({ page: 1, limit: 1 }),
                    projectsListApi({ page: 1, limit: 5 }),
                ]);

                setStats({
                    usersCount: usersResponse.total_count || 0,
                    projectsCount: projectsResponse.total_count || 0,
                });
                setRecentProjects(projectsResponse.data || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const activityData = [65, 78, 90, 81, 56, 85, 95];
    const maxActivity = Math.max(...activityData);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.full_name || 'Guest'}!</h1>
                <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.usersCount}</div>
                        <p className="text-xs text-muted-foreground">Active users in the system</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.projectsCount}</div>
                        <p className="text-xs text-muted-foreground">Projects being tracked</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">+12% from last hour</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12.5%</div>
                        <p className="text-xs text-muted-foreground">+4.5% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Activity Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                        <CardDescription>Last 7 days activity</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-50 flex items-end justify-between gap-2 px-4">
                            {activityData.map((value, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-primary/20 rounded-t-sm relative"
                                        style={{ height: `${(value / maxActivity) * 100}%`, minHeight: '20px' }}
                                    >
                                        <div
                                            className="w-full bg-primary rounded-t-sm absolute bottom-0"
                                            style={{ height: '100%' }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Projects */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                        <CardDescription>Latest projects added</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            ) : recentProjects.length > 0 ? (
                                recentProjects.map((project) => (
                                    <div key={project._id} className="flex items-start gap-3">
                                        <div className="rounded-full bg-primary/10 p-2">
                                            <FolderKanban className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <Link
                                                href={`/projects/${project._id}`}
                                                className="font-medium text-sm hover:underline truncate block"
                                            >
                                                {project.title}
                                            </Link>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {project.description || 'No description'}
                                            </p>
                                            {project.language && (
                                                <span className="inline-block text-xs bg-secondary px-2 py-0.5 rounded">
                                                    {project.language}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No projects yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
