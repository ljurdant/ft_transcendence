import { ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
export declare class ValidationFilter extends BaseWsExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void;
}
