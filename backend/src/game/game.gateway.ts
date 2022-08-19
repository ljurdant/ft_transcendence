import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { Game } from "./classes/Game"
import * as consts from "./classes/Consts"
import * as utils from "./utils"
import { GameService } from "./game.service"
import { ConfigService } from "@nestjs/config";
import { UsersService } from "src/users/users.service";

// ? How to create a game of pong
// ? First, server sends page to which clients can connect
// ? clients connected are separeted into rooms, there can only be two clients per room
// ? while a client waits for another one to show up, waiting screen
// ? once two clients are connected, server tells clients to output readiness confirmation
// ? everytime a client presses space, it sends a signal to the server to switch its readiness
// ? whenever server sees that two clients are ready, it will start a countdown from 3
// ? and send a signal to both clients after each second so that their clocks are coordinated
// ? when countdown arrives to 0, start the game by throwing the pong to one of the players at random
// ? every single movement is processed by the server

// ** This all happens in one frame ** //
// ? the pong is fully calculated on server
// ? the movements of players are sent as input to server which checks if they are correct
// ? once server decides everything is fine, send pos of pong and players to both clients
// ? clients draw whatever pos they're given
// ? whenever a pong hits one of the left/right edges, a point is given to the opposing player

/**
 * @returns game if one with 1 or less players in it
 * @returns null otherwise
 */
 function existingEmptyGame(games : Game[], username : string) : Game {
	var ref = games;
	for (const game of ref) {
		if (game.spaceAvailable(username) && game.publicity === "public") // should check if game accepts friends and if user is one
			return game;
	}
	return null;
}

function userInGame(games : Game[], username : string) : boolean {
	var ref = games;
	for (const game of ref) {
		for (const player of game.players)
			if (player.real_name === username)
				return true;
	}
	return false;
}

/**
 * loops over every game and sends a signal to ask for players's readiness
 */
 async function startGameFullRooms(games : Game[], server : Server) {
	// starts every game that has 2 players after a connection
	for (const game of games) {
		if (game.players.length === 2 && game.state === "waiting-player") {
			game.state = "waiting-readiness";
			server.to(game.room_id).emit("waiting-readiness", game.players[0].id, game.players[1].id, game.players[0].real_name, game.players[1].real_name, game.players[0].real_id, game.players[1].real_id);
		}
	}
}



@WebSocketGateway({
	cors: {
		origin: (new ConfigService).get("FRONT_URL"),
		credentials: true
	  }
  })
export class GameGateway {
	constructor(private readonly game_service: GameService, private usersService: UsersService) {}


	@WebSocketServer()
	server: Server;

	clients : string[] = [];
	users : [string, string, boolean][] = [];
	games : Game[] = [];

	timestep : number = 15; // ms

	async handleDisconnect(client : Socket) { // ? triggers when user disconnects from the website (either refresh or close tab)
		let index = -1;
		if ((index = this.clients.indexOf(client.id)) !== -1) {
			this.users.splice(index, 1);
			this.clients.splice(index, 1);
			for (let game of this.games) {
				for (const player of game.players) {
					if (player.id === client.id) {
						this.server.to(game.room_id).emit("player-disconnect", player.index);
						if (game.update_interval)
							clearInterval(game.update_interval);
						if (game.countdown_timeout)
							clearTimeout(game.countdown_timeout);
						if (game.players.length === 2 && game.state === "in-game") {
							if (game.players.indexOf(player) === 0) {
								this.game_service.incrementVictories(game.players[1].real_id, game.score[1]);
								this.game_service.createMatch({ladder: 0, winnerId : game.players[1].real_id, loserId: game.players[0].real_id, score: game.score});
							} 
							else {
								this.game_service.incrementVictories(game.players[0].real_id, game.score[0]);
								this.game_service.createMatch({ladder: 0, winnerId : game.players[0].real_id, loserId: game.players[1].real_id, score: game.score});
							}
							this.game_service.incrementLosses(player.real_id, game.score[game.players.indexOf(player)]);
						}
						this.server.emit("new disconnection", game.players[game.players.indexOf(player)].real_id);
						if (game.players.length > 1)
							this.server.emit("quit-game", game.players[(game.players.indexOf(player) + 1) % 2].real_id);
						client.leave(game.room_id);
						this.games.splice(this.games.indexOf(game), 1);
						return ;
					}
				}
				game.state = "game-over"
				for (let spectator of game.spectators) {
					if (spectator === client.id) {
						game.spectators.splice(game.spectators.indexOf(spectator), 1);
						client.leave(game.room_id);
						return ;
					}
				}
			}
		}
	}

	@SubscribeMessage("quit-ongoing-game") // ? triggers when player quits by going somewhere else on the website
	async handleQuitOngoing(@ConnectedSocket() client : Socket, @MessageBody() returnMenu : boolean) {
		let index = this.clients.indexOf(client.id);
		if (index === -1)
			return ;
		if (!returnMenu) {
			this.users.splice(index, 1);
			this.clients.splice(index, 1);
		}
		for (let game of this.games) {
			for (let player of game.players) {
				if (player.id === client.id) {
					this.server.to(game.room_id).emit("player-disconnect", player.index);
					if (game.update_interval)
						clearInterval(game.update_interval);
					if (game.countdown_timeout)
						clearTimeout(game.countdown_timeout);
					if (game.players.length === 2 && game.state === "in-game") {
						if (game.players.indexOf(player) === 0) {
							this.game_service.incrementVictories(game.players[1].real_id, game.score[1]);
							this.game_service.createMatch({ladder: 0, winnerId : game.players[1].real_id, loserId: game.players[0].real_id, score: game.score});
						} 
						else {
							this.game_service.incrementVictories(game.players[0].real_id, game.score[0]);
							this.game_service.createMatch({ladder: 0, winnerId : game.players[0].real_id, loserId: game.players[1].real_id, score: game.score});
						}
						this.game_service.incrementLosses(player.real_id, game.score[game.players.indexOf(player)]);
						this.usersService.addAchievement(player.real_id, 2);
					}
					game.state = "game-over"
					this.server.emit("quit-game", game.players[0].real_id)
					if (game.players.length > 1)
						this.server.emit("quit-game", game.players[1].real_id)
					client.leave(game.room_id);
					this.games.splice(this.games.indexOf(game), 1);
					return ;
				}
			}
			for (let spectator of game.spectators) {
				if (spectator === client.id) {
					game.spectators.splice(game.spectators.indexOf(spectator), 1);
					client.leave(game.room_id);
					return ;
				}
			}
		}
	}
	@SubscribeMessage("quit-own-game") // ? triggers when player hits return button while waiting for player
	async handleQuitOwn(@ConnectedSocket() client : Socket) {
		for (let game of this.games) {
			for (let player of game.players) {
				if (player.id === client.id) {
					if (game.update_interval)
						clearInterval(game.update_interval);
					if (game.countdown_timeout)
						clearTimeout(game.countdown_timeout);
					client.leave(game.room_id);
					if (this.games.indexOf(game) != -1)
						this.games.splice(this.games.indexOf(game), 1);
					return ;
				}
			}
		}
	}


	// ? acts as handleConnection because when calling handleConnection, multiple sockets seem to connect
	@SubscribeMessage('my_id')
	async getConnection(@MessageBody() data : {s_id : string, u_id : string, u_name : string}) {
		this.clients.push(data.s_id);
		this.users.push([data.u_id, data.u_name, false]);
	}

	@SubscribeMessage("finished loading")
	async handleFinishedLoading(@ConnectedSocket() client : Socket) {
		this.users[this.clients.indexOf(client.id)][2] = true;
	}


	@SubscribeMessage('socket response')
	async handleSocketResponseInvitation(@ConnectedSocket() client : Socket, @MessageBody() data : any) {
		for (let game of this.games) {
			if (game.room_id === data.r_id && game.polling === false) {
				game.polling = true;
				client.join(game.room_id);
				game.addPlayer(client.id, [data.id.toString(), data.name, false]);
				let inte = setInterval(() => {
					if (this.clients.indexOf(client.id) != -1 && this.clients.indexOf(data.other_id) != -1 && this.users[this.clients.indexOf(client.id)][2] === true && this.users[this.clients.indexOf(data.other_id)][2] === true) {
						this.server.to(game.room_id).emit("waiting-player", game.room_id, game.score_limit, game.map.name);
						game.state = "waiting-readiness";
						this.server.to(game.room_id).emit("waiting-readiness", game.players[0].id, game.players[1].id, game.players[0].real_name, game.players[1].real_name, game.players[0].real_id, game.players[1].real_id)
						game.polling = false;
						clearInterval(inte);
					}
				}, 500);
				setTimeout(() => {
					if (inte) {
						game.polling = false;
						clearInterval(inte);
					}
				}, 10000)
			}
		}
	}

	@SubscribeMessage("spectate game") 
	async handleSpectateGame(@ConnectedSocket() client : Socket, @MessageBody() name : string) {
		for (let game of this.games) {
			for (let player of game.players) {
				if (player.real_name === name) {
					client.join(game.room_id);
					let inte = setInterval(() => {
						if (this.clients.indexOf(client.id) != -1 && this.users[this.clients.indexOf(client.id)][2] === true) {
							this.server.to(client.id).emit("spectate", game.room_id, game.score_limit, game.map.name, game.state, game.players[0].id, (game.players.length > 1 ? game.players[1].id : "null"), game.players[0].real_name, (game.players.length > 1 ? game.players[1].real_name : "null"), game.players[0].real_id, (game.players.length > 1 ? game.players[1].real_id : 0));
							clearInterval(inte);
						}
					}, 500);
					setTimeout(() => {
						if (inte) {
							game.polling = false;
							clearInterval(inte);
						}
					}, 10000)
					
				}
			}
		}
	}

	@SubscribeMessage('accepted game')
	async handleInviteCreationGame(@ConnectedSocket() client : Socket, @MessageBody() data : [any, number]) {
		let user1 = await this.game_service.getUsername(data[0].userId);
		let user2 = await this.game_service.getUsername(data[1]);
		for (let game of this.games) {
			for (let player of game.players) {
				if (player.real_name === user1 || player.real_name === user2)
					return ;
			}
		}
		this.server.to(data[0].inviterId).emit("accepted game");
		let game = new Game(utils.randomRoomId());
		this.games.push(game);

		client.join(game.room_id);
		game.addPlayer(client.id, [data[1].toString(), user2, false]);
		this.server.emit("please send back", {id : data[0].userId, other_id : client.id, name : user1, r_id : game.room_id});
	}

	@SubscribeMessage('matchmaking')
	async handleMatchmaking(
		@ConnectedSocket() client : Socket,
		@MessageBody() data : [string, boolean, number, string]
	) {
		if (this.clients.indexOf(client.id) === -1)
			return ;
		if (userInGame(this.games, this.users[this.clients.indexOf(client.id)][1]))
			return;
		let existing_game : Game = null;
		if (data[0] === "public" && data[1])
			existing_game = existingEmptyGame(this.games, this.users[this.clients.indexOf(client.id)][1]);
		
		if (existing_game === null) {
			existing_game = new Game(utils.randomRoomId());
			this.games.push(existing_game);
		}
		existing_game.publicity = data[0];
		if (existing_game.score_limit === 0)
			existing_game.score_limit = data[2];
		if (data[3] === "city")
			existing_game.map = consts.city_map;
		else if (data[3] === "casino")
			existing_game.map = consts.casino_map;
		client.join(existing_game.room_id);
		existing_game.addPlayer(client.id, this.users[this.clients.indexOf(client.id)]);
		this.server.to(existing_game.room_id).emit("waiting-player", existing_game.room_id, existing_game.score_limit, existing_game.map.name);
		startGameFullRooms(this.games, this.server);
	}

	// ? if user is searching for a specific room
	@SubscribeMessage('find_game')
	async handleJoinGame(
		@ConnectedSocket() client : Socket,
		@MessageBody() data : [string, boolean] // room_id, spectator
	) {
		let found : boolean = false;
		for (let game of this.games) {
			if (game.room_id === data[0]) {
				found = true;
				if (data[1] === true) {
					client.join(game.room_id);
					game.addSpectator(client.id);
					this.server.to(client.id).emit("spectate", game.room_id, game.score_limit, game.map.name, game.state, game.players[0].id, (game.players.length > 1 ? game.players[1].id : "null"), game.players[0].real_name, (game.players.length > 1 ? game.players[1].real_name : "null"), game.players[0].real_id, (game.players.length > 1 ? game.players[1].real_id : 0));
				}
				else if (game.players.length < 2 && game.spaceAvailable(this.users[this.clients.indexOf(client.id)][1])) {
					client.join(game.room_id);
					game.addPlayer(client.id, this.users[this.clients.indexOf(client.id)]);
					this.server.to(game.room_id).emit("waiting-player", game.room_id, game.score_limit, game.map.name);
					game.state = "waiting-readiness";
					this.server.to(game.room_id).emit("waiting-readiness", game.players[0].id, game.players[1].id, game.players[0].real_name, game.players[1].real_name, game.players[0].real_id, game.players[1].real_id);						
				}
				else if (game.players.length < 2)
					this.server.to(client.id).emit("matchmaking-error", "already_in_game");
				else
					this.server.to(client.id).emit("matchmaking-error", "game_full");
			}
		}
		if (!found)
			this.server.to(client.id).emit("matchmaking-error", "game_not_found");
	}

	async startCountDown(game : Game) {
		game.state = "in-game"
		let test = this.server;
		test.to(game.room_id).emit("updated_pos",
			game.pong.pos, game.pong.velocity,
			[game.players[0].id, game.players[0].pos],
			[game.players[1].id, game.players[1].pos],
			game.score, game.pong.value);
		for (let i = 1; i < 5; i++)
			game.countdown_timeout = setTimeout(() => {
				if (game.state !== "game-over")
					test.to(game.room_id).emit("countdown-server");
				if (i === 4) {
					let calculate_state : string = "none";
					game.update_interval = setInterval(() => {
						if (calculate_state === "none")
							calculate_state = game.pong.calculateNewPos(game, this.server);
						if (game.over()) {
							test.to(game.room_id).emit("game-over");
							clearInterval(game.update_interval);
							var w_id : number, l_id : number;
							if (game.score[0] > game.score[1]) {
								w_id = game.players[0].real_id;
								l_id = game.players[1].real_id;
							}
							else {
								w_id = game.players[1].real_id;
								l_id = game.players[0].real_id;
							}
							this.game_service.incrementVictories(w_id, game.score[0] > game.score[1] ? game.score[0] : game.score[1]);
							this.game_service.incrementLosses(l_id, game.score[0] < game.score[1] ? game.score[0] : game.score[1]);
							this.game_service.createMatch({ladder: 0, winnerId : w_id, loserId: l_id, score: game.score});
							this.server.emit("quit-game", game.players[0].real_id)
							this.server.emit("quit-game", game.players[1].real_id)
							this.games.splice(this.games.indexOf(game), 1);
							return ;
						}
						else if (calculate_state === "relaunch") {
							game.pong.velocity = [0, 0];
							game.pong.pos = [consts.MAP_WIDTH / 2 - consts.PONG_DIAMETER / 2, consts.MAP_HEIGHT / 2 - consts.PONG_DIAMETER / 2];
							calculate_state = "null";
							game.increment_score();
							if (!game.over()) {
								setTimeout(() => {
									game.scorePoint();
									if (game.state !== "game-over")
										test.to(game.room_id).emit("relaunch");
									for (var j = 1; j < 3; j++) {
										setTimeout((index : number) => {
											if (game.state !== "game-over")
												test.to(game.room_id).emit("countdown-server");
											if (index === 2) {
												calculate_state = "none";
											}
										}, j * 1000, j);
									}
								}, 500);
							}
						}
						test.to(game.room_id).emit("updated_pos",
							game.pong.pos, game.pong.velocity,
							[game.players[0].id, game.players[0].pos],
							[game.players[1].id, game.players[1].pos],
							game.score, game.pong.value);
					}, this.timestep);
				}
			}, i * 1000);	
	}

	@SubscribeMessage("countdown_start")
	async handleCountdown(@ConnectedSocket() client : Socket) {
		for (let game of this.games) {
			for (const player of game.players) {
				if (player.id === client.id && game.state === "waiting-readiness") {
					if (game.players[0].ready && game.players[1].ready) {
						this.startCountDown(game);
						return ;
					}
				}
			}
		}
	}

	@SubscribeMessage("switch_readiness")
	async handleSwitchReadiness(
		@MessageBody() client_id : string
	) {
		for (const game of this.games) {
			for (const player of game.players) {
				if (player.id === client_id && game.players.length === 2) {
					player.ready = !player.ready;
					this.server.to(game.room_id).emit("switch_readiness-server", game.players[0].ready, game.players[1].ready, client_id);
					return ;
				}
			}
		}
	}

	@SubscribeMessage("move_up")
	async handleMoveUp(@MessageBody() client_id : string) {
		for (const game of this.games) {
			if (game.players.length === 2 && game.state === "in-game") {
				for (const player of game.players) {
					if (player.id === client_id) {
						player.moveUp();
						return ;
					}
				}
			}
		}
	}

	@SubscribeMessage("move_down")
	async handleMoveDown(@MessageBody() client_id : string) {
		for (const game of this.games) {
			if (game.players.length === 2 && game.state === "in-game") {
				for (const player of game.players) {
					if (player.id === client_id) {
						player.moveDown();
						return ;
					}
				}
			}
		}
	}

	@SubscribeMessage("move_null")
	async handleMoveNull(@MessageBody() client_id : string) {
		for (const game of this.games) {
			if (game.players.length === 2 && game.state === "in-game") {
				for (const player of game.players) {
					if (player.id === client_id) {
						player.velocity[1] = 0;
						return ;
					}
				}
			}
		}
	}
}
