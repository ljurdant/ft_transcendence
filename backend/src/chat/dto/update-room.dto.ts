import { PartialType } from "@nestjs/mapped-types";
import { IsNumber } from "class-validator";
import { CreateRoomDto } from "./create-room.dto";

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
    @IsNumber()
    id: number;
}