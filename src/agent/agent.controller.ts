import { Controller, Get,Post,Delete,Body,Param, Put, Patch,ValidationPipe, UsePipes, UseInterceptors, UploadedFile, Res, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto,LoginAgentDto,PatchAgentDto} from './agent.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterError,diskStorage } from 'multer';
import { AgentEntity } from './agent.entity';
import { AgentGuard } from 'src/auth/agentGuard';
import { CreateProductDto } from 'src/product/product.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly AgentService: AgentService) {}
  

  @Get('allagents')
  getAllAgents(): Object {
    return this.AgentService.getAllAgents();
  }

  @Post('signup')
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(new ValidationPipe())
  createAgent(@Body() createAgentDto: CreateAgentDto ): object {
    return this.AgentService.addAgent(createAgentDto);
  }

  @Post('login')
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(new ValidationPipe())
  async loginAgent(@Body() loginAgentDto: LoginAgentDto,@Res({ passthrough: true }) res): Promise<object> {
    var result = await this.AgentService.loginAgent(loginAgentDto);
    if (result['success'] && result['access_token']) {
    res.cookie('access_token', result['access_token'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // none for cross-site in production
      domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser handle domain
      maxAge: 20 * 60 * 1000, // 20 minutes
    });
    }
  
  return result;
    
  }

  @Delete('deleteagent/:id')
  // @UseGuards(AgentGuard)
  @UsePipes(new ValidationPipe())
  deleteAgent(@Param('id') id: string): object {
    return this.AgentService.deleteAgent(id);
  }

  @Patch('updateagent')
  @UseGuards(AgentGuard)
  @UsePipes(new ValidationPipe())
  partialUpdateAgent(@Query('id') id: number, @Body() updateAgentDto: PatchAgentDto): object|null {
    return this.AgentService.partialUpdateAgent(id, updateAgentDto);
  }

  @Put('updateagent/:id')
  @UseGuards(AgentGuard)
  @UsePipes(new ValidationPipe())
  updateAgent(@Param('id') id: string, @Body() updateAgentDto: CreateAgentDto): object {
    return this.AgentService.updateAgent(id, updateAgentDto);
  }

  // @Get('getagentbyid/:id')
  // @UsePipes(new ValidationPipe())
  // getAgentbyID(@Param('id', ParseIntPipe) id: number): object {
  //   return this.AgentService.getAgentbyID(id);
  // }

  @Post('upload/:id')
  @UseGuards(AgentGuard)
  @UseInterceptors(
    FileInterceptor('nidPic', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize:  2 * 1024 * 1024 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  )
  async uploadFile(@Param('id') id: number, @UploadedFile() file: Express.Multer.File): Promise<object> {
    return this.AgentService.updateProfileImage(id, file.path);
  }

  @Get('/getimage/:id')
  getImages(@Param('id') id: number, @Res() res) {
   this.AgentService.getImages(id,res);
  }

  @Get('getagentby')
  @UsePipes(new ValidationPipe())
  getAgentsbyQuery( @Query('field') field: any,@Query('data') data:any): object {
    return this.AgentService.getAgentsbyQuery(field,data);
  }

  @Get('getagentsbyage')
  @UsePipes(new ValidationPipe())
  getAgentListbyAge(@Query('age', ParseIntPipe) age: number, @Query('filter') filter: 'upper' | 'lower' | 'equal'): Promise<AgentEntity[]> {
    return this.AgentService.getAgentListbyAge(age, filter);
  }

  @Get('agentproducts/:id')
  getAgentProducts(@Param('id') id: number): object {
    return this.AgentService.getAgentProducts(id);
  }
  
  @Patch('updatepassword/:id')
  @UseGuards(AgentGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(new ValidationPipe())
  updatePassword(@Param('id') id: string, @Body() agent: PatchAgentDto): object {
    return this.AgentService.updatePassword(id, agent);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string): Promise<object> {
    return this.AgentService.verifyEmail(token);
  }

  @Get('verify-status/:email')
  checkVerificationStatus(@Param('email') email: string): Promise<boolean> {
    return this.AgentService.checkVerificationStatus(email);
  }

  @Post('createagentproduct/:id')
  @UseGuards(AgentGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(new ValidationPipe())
  createAgentProduct(@Param('id') id: string, @Body() productData: CreateProductDto): object {
    return this.AgentService.createAgentProduct(id, productData);
  }

  @Post('logout')
     @UseGuards(AgentGuard)
    logout(@Res({ passthrough: true }) res): object {
      res.clearCookie('access_token');
      return { message: 'Logged out successfully' };
    }

 @Get('verify-auth')
@UseGuards(AgentGuard)
verifyAuth(@Req() req): object {  
  console.log('Authenticated user:', req.user);
  return {
    authenticated: true,
    agentId: req.user.sub,
    email: req.user.email,
    role: req.user.role
  };
}


  

}
