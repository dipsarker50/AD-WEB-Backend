import { Controller, Get,Post,Delete,Body,Param, Put, Patch,ValidationPipe, UsePipes, UseInterceptors, UploadedFile, Res, Query } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto,PatchAgentDto} from './agent.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterError,diskStorage } from 'multer';


@Controller('agent')
export class AgentController {
  constructor(private readonly AgentService: AgentService) {}

  @Get('allagents')
  getAllAgents(): Object {
    return this.AgentService.getAllAgents();
  }

  @Post('createagent')
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(new ValidationPipe())
  createAgent(@Body() createAgentDto: CreateAgentDto ): object {
    console.log(createAgentDto);
    return this.AgentService.addAgent(createAgentDto);
  }

  @Delete('deleteagent/:id')
  @UsePipes(new ValidationPipe())
  deleteAgent(@Param('id') id: string): object {
    return this.AgentService.deleteAgent(id);
  }

  @Patch('updateagent')
  @UsePipes(new ValidationPipe())
  partialUpdateAgent(@Query('id') id: string, @Body() updateAgentDto: PatchAgentDto): object {
    return this.AgentService.partialUpdateAgent(id, updateAgentDto);
  }

  @Put('updateagent/:id')
  @UsePipes(new ValidationPipe())
  updateAgent(@Param('id') id: string, @Body() updateAgentDto: CreateAgentDto): object {
    return this.AgentService.updateAgent(id, updateAgentDto);
  }

  @Get('getagentbyid/:id')
  @UsePipes(new ValidationPipe())
  getAgentbyID(@Param('id') id: string): object {
    return this.AgentService.getAgentbyID(id);
  }


  @Post('upload/:id')
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
  uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    this.AgentService.updateProfileImage(id, file.path);
  }

  @Get('/getimage/:id')
  getImages(@Param('id') id: string, @Res() res) {
    const agent = this.AgentService.getAgentbyID(id);
    res.sendFile(agent.nidImage, { root: './uploads' });
  }


}
