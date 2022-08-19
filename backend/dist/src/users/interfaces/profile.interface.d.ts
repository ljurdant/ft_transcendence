import { Match } from '@prisma/client';
export interface Profile {
    id: number;
    username: string;
    firstLogin: boolean;
    tfa: boolean;
    victories: number;
    losses: number;
    level: number;
    matchHistory: Match[];
    achievements: number[];
}
