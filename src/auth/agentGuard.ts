import { CanActivate, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AgentGuard implements CanActivate { 
    constructor(private jwtService: JwtService) {}

    async canActivate(context): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let token: string | null;

        // Try to get token from cookie first (HTTP-only cookie auth)
        token = request.cookies?.access_token;

        // If no cookie, try Authorization header (Bearer token auth)
        if (!token) {
            const authHeader = request.headers.authorization;
            if (authHeader) {
                token = authHeader.split(' ')[1];
            }
        }

        // If still no token found
        if (!token) {
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

        // ⭐ FIXED: Only validate ID if it exists in the request
        // const requestedId = request.params.id || request.query.id || request.body.id;
        // console.log('Requested Agent ID:', requestedId);
        // if (requestedId) {
        //     // Only check if requestedId exists
        //     if (parseInt(requestedId) !== payload.sub) {
        //         throw new UnauthorizedException('Request not allowed for this agent ID');
        //     }
        // }

        // Attach user to request for use in controllers
        request.user = payload;

        return true;
    }
}
