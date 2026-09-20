import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string, withSecrets = false) {
    const query = this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (withSecrets) {
      query.select('+passwordHash +refreshTokenHash');
    }
    return query.exec();
  }

  findById(id: string | Types.ObjectId, withSecrets = false) {
    const query = this.userModel.findById(id);
    if (withSecrets) {
      query.select('+passwordHash +refreshTokenHash');
    }
    return query.exec();
  }

  create(email: string, passwordHash: string, name?: string) {
    return this.userModel.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
    });
  }

  setRefreshTokenHash(
    userId: string | Types.ObjectId,
    refreshTokenHash: string | null,
  ) {
    return this.userModel
      .updateOne({ _id: userId }, { refreshTokenHash })
      .exec();
  }
}
