import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    findLeaders(): Promise<import(".prisma/client").Stats[]>;
}
