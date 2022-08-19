"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2Strategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_oauth2_1 = require("passport-oauth2");
const users_service_1 = require("../../users/users.service");
const auth_service_1 = require("../auth.service");
let OAuth2Strategy = class OAuth2Strategy extends (0, passport_1.PassportStrategy)(passport_oauth2_1.Strategy, 'oauth2') {
    constructor(usersService, configService, authService) {
        super({
            authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            clientID: configService.get('CLIENT_ID'),
            clientSecret: configService.get('CLIENT_SECRET'),
            callbackURL: configService.get('BACK_URL') + '/auth',
        });
        this.usersService = usersService;
        this.configService = configService;
        this.authService = authService;
    }
    async validate(accessToken) {
        const userId = await this.authService.validateUser(accessToken);
        const user = await this.usersService.findOrCreateUser(userId);
        const authUser = { id: user.id, isAuthenticated: !user.tfa };
        return authUser;
    }
};
OAuth2Strategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService,
        auth_service_1.AuthService])
], OAuth2Strategy);
exports.OAuth2Strategy = OAuth2Strategy;
//# sourceMappingURL=oauth2.strategy.js.map