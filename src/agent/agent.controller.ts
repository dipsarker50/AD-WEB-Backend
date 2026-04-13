import { Controller, Get,Post,Delete,Body,Param, Put, Patch,ValidationPipe, UsePipes, UseInterceptors, UploadedFile, Res, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto,LoginAgentDto,PatchAgentDto} from './agent.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterError } from 'multer';
import { AgentEntity } from './agent.entity';
import { AgentGuard } from 'src/auth/agentGuard';
import { CreateProductDto } from 'src/product/product.dto';
import { SupabaseService } from 'src/storage/supabase.service';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly AgentService: AgentService,
    private readonly supabaseService: SupabaseService
  ) {}
  

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
      const isProduction = process.env.NODE_ENV === 'production';
      
      const cookieOptions: any = {
        httpOnly: true,
        maxAge: 20 * 60 * 1000, // 20 minutes
        path: '/', // Ensure cookie is available for all paths
        secure: isProduction, // Only secure in production (HTTPS)
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
      };

      // For production deployments like Render, ensure proper domain handling
      if (isProduction) {
        // Don't set domain to allow cross-origin cookies
        // Add partitioned attribute for Chrome's third-party cookie restrictions
        cookieOptions.partitioned = true;
      }

      console.log('Setting cookie with options:', cookieOptions);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Frontend URL:', process.env.FRONTEND_URL);
      
      try {
        res.cookie('access_token', result['access_token'], cookieOptions);
        console.log('Cookie set successfully');
      } catch (error) {
        console.error('Error setting cookie:', error);
      }
      
      // Always include token in response body as primary method for frontend
      result['token'] = result['access_token'];
      
      // Add additional headers for better cross-origin support
      if (isProduction) {
        res.header('Access-Control-Expose-Headers', 'Set-Cookie');
      }
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
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadFile(@Param('id') id: number, @UploadedFile() file: Express.Multer.File): Promise<object> {
    try {
      // Upload to Supabase
      const imageUrl = await this.supabaseService.uploadFile(
        file,
        `agents/${id}/${Date.now()}-${file.originalname}`,
      );
      
      // Update agent profile with Supabase URL
      return this.AgentService.updateProfileImage(id, imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: 'Failed to upload image',
        error: (error as Error)?.message || 'Unknown upload error',
      };
    }
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
      const clearOptions: any = {
        httpOnly: true,
      };

      if (process.env.NODE_ENV === 'production') {
        clearOptions.secure = true;
        clearOptions.sameSite = 'none';
      } else {
        clearOptions.secure = false;
        clearOptions.sameSite = 'lax';
      }

      res.clearCookie('access_token', clearOptions);
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
