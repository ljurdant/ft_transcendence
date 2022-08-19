"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = exports.jwtConstants = void 0;
const config_1 = require("@nestjs/config");
exports.jwtConstants = {
    secret: new config_1.ConfigService().get('JWT_SECRET'),
};
exports.cookieOptions = {
    sameSite: "strict",
    httpOnly: true,
};
//# sourceMappingURL=constants.js.map