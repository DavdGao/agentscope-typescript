export interface Schedule {
    id: string;
    name: string;
    enabled: boolean;
    description: string;
    sessionId?: string;
    cronExpr: string;
    startAt: number; // timestamp ms, cron occurrences before this are ignored
    endAt?: number; // optional expiry timestamp ms
}
