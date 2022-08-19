import { Strategy } from 'passport-jwt';
declare const JwtOtpStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtOtpStrategy extends JwtOtpStrategy_base {
    constructor();
    validate(payload: any): Promise<any>;
}
export {};
