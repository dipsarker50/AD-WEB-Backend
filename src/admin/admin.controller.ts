import { Controller, Get,Post,Delete,Body,Param, Put, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto,UpdateAdminDto,UpdatePartialAdminDto,Admin } from './admin.dto';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('allAdmins')
  getAllAdmins(): Object {
    return this.adminService.getAllAdmins();
  }

  @Post('addAdmin')
  addAdmin(@Body() createAdminDto: CreateAdminDto): object {
    return this.adminService.addAdmin(createAdminDto);
  }

  @Delete('deleteAdmin/:id')
  deleteAdmin(@Param('id') id: number): object {
    return this.adminService.deleteAdmin(id);
  }

  @Patch('updateAdmin/:id')
  partialUpdateAdmin(@Param('id') id: number, @Body() updateAdminDto: UpdatePartialAdminDto): object {
    return this.adminService.partialUpdateAdmin(id, updateAdminDto);
  }

  @Put('updateAdmin/:id')
  updateAdmin(@Param('id') id: number, @Body() updateAdminDto: UpdateAdminDto): object {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }


}
