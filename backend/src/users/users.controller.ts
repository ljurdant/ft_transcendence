import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Put,
  UploadedFile,
  UseInterceptors,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Profile } from './interfaces/profile.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserParams } from './params/user.params';
import { rename } from 'fs';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAllUsers(): Promise<any> {
    return this.usersService.getAllUsers();
  }

  @Get('me')
  async findMe(@Req() req): Promise<Profile> {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @Put('upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      dest: 'tmp/',
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/^image/)) {
          cb(null, true);
        } else {
          cb(new UnsupportedMediaTypeException(), false);
        }
      },
      limits: {
        fileSize: 1048576,
      },
    }),
  )
  uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    rename(file.path, 'public/avatars/' + req.user.id + '.png', (err) => {
      if (err) throw err;
      // console.log('Image upload success.');
    });
    this.usersService.addAchievement(req.user.id, 3);
    return true;
  }

  @Get(':id')
  async findOne(@Param() params: UserParams): Promise<Profile> {
    return this.usersService.getProfile(+params.id);
  }
}
