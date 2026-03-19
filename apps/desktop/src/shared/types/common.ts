export interface BaseListItem {
    id: string;
    name: string;
    pinned: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface GetItemsQuery {
    offset: number;
    limit: number;
}

export interface GetItemsResult<T extends BaseListItem> {
    pinned: T[];
    items: T[];
    total: number;
    hasMore: boolean;
}
