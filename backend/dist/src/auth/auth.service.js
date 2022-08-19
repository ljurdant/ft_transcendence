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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const otplib_1 = require("otplib");
const axios_1 = require("axios");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(accessToken) {
        const { data } = await (0, axios_1.default)({
            url: 'https://api.intra.42.fr/v2/me',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });
        if (!data) {
            throw new common_1.UnauthorizedException();
        }
        return data.id;
    }
    async login(userId, isAuthenticated) {
        const payload = { sub: userId, isAuthenticated };
        const token = this.jwtService.sign(payload);
        return token;
    }
    async validateGoogleAuthenticatorToken(userId, otp) {
        const { otpSecret } = await this.usersService.findOne(userId);
        const validated = otplib_1.authenticator.check(otp.value, otpSecret);
        return validated;
    }
    async getMock(id) {
        return this.usersService.findOrCreateUser(id);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map