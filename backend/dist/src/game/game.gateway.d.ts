import { Socket, Server } from "socket.io";
import { Game } from "./classes/Game";
import { GameService } from "./game.service";
import { UsersService } from "src/users/users.service";
export declare class GameGateway {
    private readonly game_service;
    private usersService;
    constructor(game_service: GameService, usersService: UsersService);
    server: Server;
    clients: string[];
    users: [string, string, boolean][];
    games: Game[];
    timestep: number;
    handleDisconnect(client: Socket): Promise<void>;
    handleQuitOngoing(client: Socket, returnMenu: boolean): Promise<void>;
    handleQuitOwn(client: Socket): Promise<void>;
    getConnection(data: {
        s_id: string;
        u_id: string;
        u_name: string;
    }): Promise<void>;
    handleFinishedLoading(client: Socket): Promise<void>;
    handleSocketResponseInvitation(client: Socket, data: any): Promise<void>;
    handleSpectateGame(client: Socket, name: string): Promise<void>;
    handleInviteCreationGame(client: Socket, data: [any, number]): Promise<void>;
    handleMatchmaking(client: Socket, data: [string, boolean, number, string]): Promise<void>;
    handleJoinGame(client: Socket, data: [string, boolean]): Promise<void>;
    startCountDown(game: Game): Promise<void>;
    handleCountdown(client: Socket): Promise<void>;
    handleSwitchReadiness(client_id: string): Promise<void>;
    handleMoveUp(client_id: string): Promise<void>;
    handleMoveDown(client_id: string): Promise<void>;
    handleMoveNull(client_id: string): Promise<void>;
}
