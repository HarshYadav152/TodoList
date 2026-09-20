import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Share, ShareDocument, SharePermission } from './schemas/share.schema';

const PERMISSION_RANK: Record<SharePermission, number> = { view: 1, edit: 2 };

@Injectable()
export class SharesService {
  constructor(
    @InjectModel(Share.name) private readonly shareModel: Model<ShareDocument>,
    private readonly usersService: UsersService,
  ) {}

  async shareWith(ownerId: string, email: string, permission: SharePermission) {
    const invitee = await this.usersService.findByEmail(email);
    if (!invitee) {
      throw new NotFoundException('No account exists with that email');
    }
    if (invitee._id.toString() === ownerId) {
      throw new BadRequestException("You can't share your list with yourself");
    }

    return this.shareModel
      .findOneAndUpdate(
        { owner: new Types.ObjectId(ownerId), sharedWithUser: invitee._id },
        { permission },
        { upsert: true, new: true },
      )
      .exec();
  }

  async revoke(ownerId: string, shareId: string) {
    const share = await this.shareModel.findById(shareId).exec();
    if (!share || share.owner.toString() !== ownerId) {
      throw new NotFoundException('Share not found');
    }
    await share.deleteOne();
  }

  /** Lists shared with me (i.e. lists I can view/edit but don't own). */
  async listSharedWithMe(userId: string) {
    return this.shareModel
      .find({ sharedWithUser: new Types.ObjectId(userId) })
      .populate('owner', 'email name')
      .exec();
  }

  /** Lists I've shared out (used to manage/revoke access I've granted). */
  async listMyShares(ownerId: string) {
    return this.shareModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .populate('sharedWithUser', 'email name')
      .exec();
  }

  /**
   * Central access-control check used by TodosService for every
   * read/write. `viewerId === ownerId` (looking at your own list) always
   * passes with edit rights. Otherwise there must be a Share record from
   * `ownerId` to `viewerId` at or above `required`.
   */
  async assertAccess(
    viewerId: string,
    ownerId: string,
    required: SharePermission,
  ): Promise<void> {
    if (viewerId === ownerId) return;

    const share = await this.shareModel
      .findOne({
        owner: new Types.ObjectId(ownerId),
        sharedWithUser: new Types.ObjectId(viewerId),
      })
      .exec();

    if (
      !share ||
      PERMISSION_RANK[share.permission] < PERMISSION_RANK[required]
    ) {
      // 404 rather than 403: don't reveal whether the target list exists
      // at all to someone with no access to it.
      throw new NotFoundException('List not found');
    }
  }
}
