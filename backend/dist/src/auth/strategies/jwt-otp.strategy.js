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
exports.JwtOtpStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const constants_1 = require("../constants");
const jwt_strategy_1 = require("./jwt.strategy");
let JwtOtpStrategy = class JwtOtpStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-otp') {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([jwt_strategy_1.JwtStrategy.cookieExtractor]),
            secretOrKey: constants_1.jwtConstants.secret,
        });
    }
    async validate(payload) {
        if (payload.isAuthenticated === false) {
            const user = { id: payload.sub };
            return user;
        }
    }
};
JwtOtpStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtOtpStrategy);
exports.JwtOtpStrategy = JwtOtpStrategy;
//# sourceMappingURL=jwt-otp.strategy.js.map