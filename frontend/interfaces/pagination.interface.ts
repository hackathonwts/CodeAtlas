export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total_pages: number;
    total_count: number;
    message: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
}