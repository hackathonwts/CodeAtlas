
// const params = useParams()
// const project_id = params[':id'] as string;

import { ParsingStats } from "./parsing-stats";
import { ProjectHeader } from "./project-header";
import { ProjectInfo } from "./project-info";
import { ProjectTimeline } from "./project-timeline";
import { StatusCards } from "./status-cards";
import { TeamMembers } from "./team-members";

// const fetchProjectDetails = async (id: string) => {
//     const response = await getProjectApi(id);
// }

// useEffect(() => {
//     fetchProjectDetails(project_id);
//     console.log("Project ID:", project_id);
// }, [project_id]);


// const params = useParams()
// const project_id = params[':id'] as string;

// const fetchProjectDetails = async (id: string) => {
//     const response = await getProjectApi(id);
// }

// useEffect(() => {
//     fetchProjectDetails(project_id);
//     console.log("Project ID:", project_id);
// }, [project_id]);



export default function ProjectDetailsPage() {
    return (
        <div className="min-h-screen bg-background">
            <ProjectHeader
                name="NestJS E-Commerce API"
                description="Parse and analyze the NestJS e-commerce backend API codebase for AI-powered knowledge transfer. This project extracts modules, controllers, services, and entity relationships."
                repoUrl="https://github.com/acme/nestjs-ecommerce-api"
                status="active"
            />

            <div className="space-y-8">
                {/* Status Overview */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Processing Status</h2>
                    <StatusCards />
                </section>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Timeline & Team */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProjectTimeline />
                        <ParsingStats />
                    </div>

                    {/* Right Column - Info & Members */}
                    <div className="space-y-6">
                        <ProjectInfo
                            repoUrl="https://github.com/acme/nestjs-ecommerce-api"
                            branch="main"
                            lastCommit="feat: add user authentication"
                            createdAt="Jan 15, 2026"
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
