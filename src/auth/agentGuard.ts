import { CanActivate, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AgentGuard implements CanActivate { 
        constructor(private jwtService:JwtService) {}

        async canActivate(context):Promise<boolean> {
                const request=context.switchToHttp().getRequest();
                const authHeader=request.headers.authorization;
                if(!authHeader){
                        throw new UnauthorizedException('Unauthorized access');
                }
                const token=authHeader.split(' ')[1];
                    let payload;
                try {
                payload = await this.jwtService.verifyAsync(token);
                } catch (error) {
                   throw new UnauthorizedException('Invalid or expired token');
                }
                
                if (payload.role !== 'agent') {
                   throw new UnauthorizedException('Agent access only');
                }

                const requestedId = request.params.id || request.query.id || request.body.id;
                if (requestedId && parseInt(requestedId) !== payload.sub) {
                throw new UnauthorizedException('Request not allowed for this agent ID');
                }

                request.user = payload;

                return true;
        }
 }