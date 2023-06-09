import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { ProfileService } from 'src/profile/profile.service';
import { RolesService } from 'src/roles/roles.service';
import { User } from 'src/user/entities/user-entity';
import { UserService } from 'src/user/user.service';
import { DataSource } from 'typeorm';
import { LoginDTO } from './dtos/login-dto';
import { RegisterDTO } from './dtos/register-dto';
import { USER, ADMIN } from '../roles/roles'


@Injectable()
export class AuthService {
    constructor(
        private readonly jwt: JwtService,
        private readonly userService: UserService,
        private readonly profileService: ProfileService,
        private readonly roleService: RolesService,
        private dataSource: DataSource, // транзакции
    ) { }

    async login(dto: LoginDTO) {
        const user = await this.validateUser(dto);
        return this.generateToken(user);
    }

    async register(dto: RegisterDTO) {
        if (await this.userService.hasUserWithEmail(dto.email)) {
            throw new HttpException(`User with email ${dto.email} already exist`, HttpStatus.NOT_ACCEPTABLE);
        }

        // нет смысла создать пользователя без профайла - исолзуем транзакцию,
        // чтобы либо создались оба, либо не создалось ничего
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let user: User;
        
        try {
            const simpleUserRole = await this.roleService.ensureHasRole(USER);
            user = await this.userService.create(dto.login, dto.email, dto.password);
            const userRole = this.roleService.assignRoleToUser(user, simpleUserRole)
            const profile = await this.profileService.create(dto.name, dto.surname, dto.phone);
            profile.user = user;

            await queryRunner.manager.save(user);
            await queryRunner.manager.save(userRole);
            await queryRunner.manager.save(profile);

            // транзакция удалась
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction(); // откати
            return 'Что-то пошло не так';
        } finally {
            await queryRunner.release();
        }

        return this.generateToken(user);
    }

    private async generateToken(user: User) {
        const roles = await this.userService.getRoles(user);
        const payload = { email: user.email, id: user.id, roles };
        const token = this.jwt.sign(payload);
        return { token };
    }

    private async validateUser(dto: LoginDTO) {
        try {
            const user = await this.userService.findByEmail(dto.email);
            if (user && await user.checkPassword(dto.password)) {
                return user;
            }
            throw new UnauthorizedException({ message: 'Некорректный емайл или пароль' });
        } catch (e) {
            throw new UnauthorizedException({ message: 'Авторизация не удалась' });
        }
    }

}
