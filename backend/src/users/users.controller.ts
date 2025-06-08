// src/users/users.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUsersDto } from './dto/search-users.dto';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { SetAvatarByUrlDto } from './dto/set-avatar-by-url.dto';
import { SearchUserOptionsDto } from './dto/search-user-options.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('all')
    async getAllUsers(@Query() query: SearchUsersDto) {
        return this.usersService.getAllUsers(query);
    }

    @Get('by-email')
    async getUserByEmail(@Query() query: FindUserByEmailDto) {
        return this.usersService.findByEmail(query.email);
    }

    @Get('options')
    async getUserOptions(@Query() query: SearchUserOptionsDto) {
        return this.usersService.getUserOptions(query);
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateAvatarDto
    ) {
        return this.usersService.uploadAvatar(file, body.email);
    }

    @Patch('update-info')
    async updateUserInfo(
        @Body('email') email: string,
        @Body() body: UpdateUserInfoDto
    ) {
        return this.usersService.updateUserInfo(email, body);
    }

    @Delete(':email')
    async deleteUser(@Param('email') email: string) {
        return this.usersService.deleteUserByEmail(email);
    }

    @Post('avatar/url')
    async setAvatarByUrl(@Body() body: SetAvatarByUrlDto) {
        return this.usersService.setAvatarByUrl(body.email, body.avatar_url);
    }

}
