
interface Match {
	date: string;
	id: number;
	ladder: number;
	winnerId:number;
	players: any[];
	score: number[];
}

interface User {
	id: number;
	username: string;
	tfa: boolean;
	firstLogin: boolean;
	victories: number;
	losses: number;
	level: number;
	matchHistory: Match[];
	achievements: number[];
}

const init_user = {} as User

interface Room {
    id: number;
    name: string;
    ownerId: number;
    visibility: string;
    password: string;
}

interface Message {
    id:number;
    content: string;
    userId: number;
    roomId: number;
    type: boolean;
}

interface Stats {
	id: number;
	username: string;
	victories: number;
	losses: number;
	level: number;
	userId: number;
}

const init_stats = {} as Stats

export {User, init_user, Room, Message, Stats, init_stats}