"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log((0, path_1.join)(__dirname, '..', 'public'));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', '..', 'public'));
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }));
    app.enableCors({
        origin: (new config_1.ConfigService).get("FRONT_URL"),
        credentials: true
    });
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map