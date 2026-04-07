import { IsMongoId } from "class-validator";

export class CreateFriendRequestDto {
  @IsMongoId()
  receiverId!: string;
}
