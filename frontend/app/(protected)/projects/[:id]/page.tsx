"use client";

import { useParams } from "next/navigation";
import { ProjectHeader } from "./project-header";
import { ProjectInfo } from "./project-info";
import { ProjectTimeline } from "./project-timeline";
import { TeamMembers } from "./team-members";
import { getProjectByUuidApi } from "@/app/utils/apis/projects-api";
import { useEffect, useState } from "react";
import { IProject } from "@/interfaces/project.interface";
import moment from "moment";
import { toast } from "sonner";
import { ProjectStatus } from "./project-status";


export default function ProjectDetailsPage() {
    const params = useParams();
    const project_uid = params[':id'] as string;
    const [project, setProject] = useState<Partial<IProject>>({});

    const fetchProject = async () => await getProjectByUuidApi(project_uid);
    useEffect(() => {
        if (project_uid) {
            fetchProject().then(result => {
                setProject(result);
            }).catch(error => {
                toast.error(error?.response?.data?.message || "Failed to fetch project details");
            });
        }
    }, [project_uid]);

    return (
        <div className="container mx-auto py-1">
            <ProjectHeader
                name={project.title}
                description={project.description}
                repoUrl={project.git_link}
                status={project.status}
            />

            <div className="space-y-8">
                {/* Status Overview */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Processing Status</h2>
                    <ProjectStatus />
                </section>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Timeline */}
                    <div className="lg:col-span-2">
                        <ProjectTimeline />
                    </div>

                    {/* Right Column - Info & Members */}
                    <div className="space-y-6">
                        <ProjectInfo
                            repoUrl={project.git_link}
                            branch={project.git_branch}
                            lastCommit="feat: add user authentication"
                            createdAt={moment(project.createdAt).format('LLL')}
                            framework="NestJS 10.x"
                            nodeVersion="20.x"
                        />
                        <TeamMembers />
                    </div>
                </div>
            </div>
        </div>
    )
}
