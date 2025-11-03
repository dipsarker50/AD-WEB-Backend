import { Injectable,Body } from '@nestjs/common';
import { CreateAdminDto,UpdateAdminDto,UpdatePartialAdminDto } from './admin.dto';
@Injectable()
export class AdminService {
  getHello(): string {
    return 'Hello World!';
  }

  addAdmin(adminData: CreateAdminDto): object {
    return { message: 'Admin added successfully!' , name: adminData.name};
  }

  deleteAdmin(id: number): object {
    return { message: 'Admin deleted successfully!'};
  }

  getAllAdmins(): object {
    return { name: 'Admin1', email: 'admin1@example.com'};
  }

  partialUpdateAdmin(id: number, adminData: UpdatePartialAdminDto): object {
    return { message: 'Admin updated successfully!',  values: adminData };
  }

  updateAdmin(id: number, adminData: UpdateAdminDto): object {
    return { message: 'Admin updated successfully!', values: adminData };
  }
  

}
