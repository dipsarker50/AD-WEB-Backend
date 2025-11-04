import { Injectable} from '@nestjs/common';
import { CreateFarmerDto,PatchFarmerDto } from './farmer.dto';
@Injectable()
export class FarmerService {
  getHello(): string {
    return 'Hello World!';
  }

  addFarmer(FarmerData: CreateFarmerDto): object {
    return { message: 'Farmer added successfully!' , name: FarmerData.fullName};
  }

  deleteFarmer(id: string): object {
    return { message: 'Farmer deleted successfully!'};
  }

  getAllFarmers(): object {
    return { name: 'Farmer1', email: 'Farmer1@example.com'};
  }

  partialUpdateFarmer(id: string, FarmerData: PatchFarmerDto): object {
    return { message: 'Farmer updated successfully!',  values: FarmerData };
  }

  updateFarmer(id: string, FarmerData: CreateFarmerDto): object {
    return { message: 'Farmer updated successfully!', values: FarmerData };
  }
  
  getFarmersIDbyPhone(phone: string): string {
      return "1";
  }

  getFarmerbyID(id: string): PatchFarmerDto {
      return { fullName: 'Farmer1', profileImage:"sample.jpg"};
  }

}
