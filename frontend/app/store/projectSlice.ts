import { IProject } from '@/interfaces/project.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ProjectState = {
    projects: IProject[];
    selectedProject: IProject | null;
    isProjectsLoading: boolean;
};

const initialState: ProjectState = {
    projects: [],
    selectedProject: null,
    isProjectsLoading: false,
};

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setProjects: (state, action: PayloadAction<IProject[]>) => {
            state.projects = action.payload;
        },
        addProject: (state, action: PayloadAction<IProject>) => {
            state.projects = [action.payload, ...state.projects];
        },
        updateProject: (state, action: PayloadAction<{ projectId: string; updates: Partial<IProject> }>) => {
            const { projectId, updates } = action.payload;
            const index = state.projects.findIndex((project) => project._id === projectId);
            if (index !== -1) {
                state.projects[index] = { ...state.projects[index], ...updates };
            }
            if (state.selectedProject?._id === projectId) {
                state.selectedProject = { ...state.selectedProject, ...updates };
            }
        },
        removeProject: (state, action: PayloadAction<string>) => {
            state.projects = state.projects.filter((project) => project._id !== action.payload);
            if (state.selectedProject?._id === action.payload) {
                state.selectedProject = null;
            }
        },
        setCurrentProject: (state, action: PayloadAction<IProject | null>) => {
            state.selectedProject = action.payload;
        },
        setProjectsLoading: (state, action: PayloadAction<boolean>) => {
            state.isProjectsLoading = action.payload;
        },
    },
});

export const { setProjects, addProject, updateProject, removeProject, setCurrentProject, setProjectsLoading } =
    projectSlice.actions;

export default projectSlice.reducer;
