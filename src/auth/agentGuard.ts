import { CanActivate, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AgentGuard implements CanActivate { 
    constructor(private jwtService: JwtService) {}

    async canActivate(context): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let token: string | null;

        // Debug logging
        console.log('=== Authentication Debug ===');
        console.log('Cookies:', request.cookies);
        console.log('Authorization header:', request.headers.authorization);
        console.log('All headers:', request.headers);

        token = request.cookies?.access_token;

        if (!token) {
            const authHeader = request.headers.authorization;
            if (authHeader) {
                token = authHeader.split(' ')[1];
            }
        }

        console.log('Extracted token:', token ? 'Found' : 'Not found');

        if (!token) {
            console.log('No token found - returning unauthorized');
            throw new UnauthorizedException('Unauthorized access');
        }

        let payload;
        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
        
        if (payload.role !== 'agent') {
            throw new UnauthorizedException('Agent access only');
        }
        request.user = payload;

        return true;
    }
}
