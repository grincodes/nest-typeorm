import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitOfWork } from '../database/unitofwork';
import { Profile } from './profile.entity';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    private unitOfWork: UnitOfWork,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(): Promise<any> {
    await this.unitOfWork.startTransaction();

    const userRepository = this.unitOfWork.getRepository(User);
    const profileRepository = this.unitOfWork.getRepository(Profile);

    const work = () => {
      userRepository.save({
        firstName: 'mada',
        lastName: 'bada',
      });

      profileRepository.save({
        dob: '29-4-1998',
        nationality: 'nigerian',
      });
    };

    this.unitOfWork.complete(work);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
