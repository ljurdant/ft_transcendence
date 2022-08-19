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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const oauth2_auth_guard_1 = require("./guards/oauth2-auth.guard");
const jwt_otp_auth_guard_1 = require("./guards/jwt-otp-auth.guard");
const validate_otp_dto_1 = require("./dto/validate-otp.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const config_1 = require("@nestjs/config");
const constants_1 = require("./constants");
let AuthController = class AuthController {
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async login(req, res) {
        const token = await this.authService.login(req.user.id, req.user.isAuthenticated);
        res.cookie('jwt', token, constants_1.cookieOptions);
        let redirectUrl = this.configService.get('FRONT_URL');
        if (req.user.isAuthenticated === false) {
            redirectUrl += '/tfauth';
        }
        return { url: redirectUrl };
    }
    async googleAuthenticatorLoginCheck() {
        return true;
    }
    async googleAuthenticatorLogin(req, res, otp) {
        const validated = await this.authService.validateGoogleAuthenticatorToken(req.user.id, otp);
        if (validated === true) {
            const token = await this.authService.login(req.user.id, true);
            res.cookie('jwt', token, constants_1.cookieOptions);
            return true;
        }
        return false;
    }
    async logout(res) {
        res.cookie('jwt', '', { ...constants_1.cookieOptions, expires: new Date() });
    }
    async mockLogin(id, res) {
        const user = await this.authService.getMock(+id);
        const isAuthenticated = !user.tfa;
        const token = await this.authService.login(user.id, isAuthenticated);
        res.cookie('jwt', token, constants_1.cookieOptions);
        let redirectUrl = this.configService.get('FRONT_URL');
        if (isAuthenticated === false) {
            redirectUrl += '/tfauth';
        }
        console.log(redirectUrl);
        return { url: redirectUrl };
    }
};
__decorate([
    (0, common_1.UseGuards)(oauth2_auth_guard_1.OAuth2AuthGuard),
    (0, common_1.Get)(),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_otp_auth_guard_1.JwtOtpAuthGuard),
    (0, common_1.Get)('google-authenticator'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthenticatorLoginCheck", null);
__decorate([
    (0, common_1.UseGuards)(jwt_otp_auth_guard_1.JwtOtpAuthGuard),
    (0, common_1.Post)('google-authenticator'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, validate_otp_dto_1.ValidateOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthenticatorLogin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('mock/:id'),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "mockLogin", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map