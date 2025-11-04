import { Controller, Get,Post,Delete,Body,Param, Put, Patch,ValidationPipe, UsePipes, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FarmerService } from './farmer.service';
import { CreateFarmerDto,PatchFarmerDto} from './farmer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError,diskStorage } from 'multer';


@Controller('farmer')
export class FarmerController {
  constructor(private readonly FarmerService: FarmerService) {}

  @Get('allfarmers')
  getAllFarmers(): Object {
    return this.FarmerService.getAllFarmers();
  }

  @Post('createfarmer')
  @UsePipes(new ValidationPipe())
  createFarmer(@Body() createFarmerDto: CreateFarmerDto ): object {
    return this.FarmerService.addFarmer(createFarmerDto);
  }

  @Delete('deletefarmer/:id')
  @UsePipes(new ValidationPipe())
  deleteFarmer(@Param('id') id: string): object {
    return this.FarmerService.deleteFarmer(id);
  }

  @Patch('updatefarmer/:id')
  @UsePipes(new ValidationPipe())
  partialUpdateFarmer(@Param('id') id: string, @Body() updateFarmerDto: PatchFarmerDto): object {
    return this.FarmerService.partialUpdateFarmer(id, updateFarmerDto);
  }

  @Put('updatefarmer/:id')
  @UsePipes(new ValidationPipe())
  updateFarmer(@Param('id') id: string, @Body() updateFarmerDto: CreateFarmerDto): object {
    return this.FarmerService.updateFarmer(id, updateFarmerDto);
  }

  @Get('getfarmerbyid/:id')
  @UsePipes(new ValidationPipe())
  getFarmerbyID(@Param('id') id: string): object {
    return this.FarmerService.getFarmerbyID(id);
  }


  @Post('upload/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 30000 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return { message: 'File uploaded successfully', filePath: file.path };
  }

  @Get('/getimage/:id')
  getImages(@Param('id') id: string, @Res() res) {
    const farmer = this.FarmerService.getFarmerbyID(id);
      res.sendFile(farmer.profileImage, { root: './uploads' });
  }


}
