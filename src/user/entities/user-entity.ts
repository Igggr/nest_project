import { Profile } from "src/profile/entities/profile-entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "src/roles/entities/user-role-entity";
import { Length, IsEmail, IsString, IsInt, IsPositive } from 'class-validator';
import { Exclude, instanceToPlain, Type } from "class-transformer";


@Entity()
export class User {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @ApiProperty({description: 'Primary key', example: 1})
    @PrimaryGeneratedColumn()
    id: number;

    @Type(() => String)
    @IsString()
    @Length(3, 20)
    @ApiProperty({ description: "login", example: 'John43' })
    @Column({ type: String })
    login: string;

    @Type(() => String)
    @IsEmail()
    @ApiProperty({description: 'email', example: 'johndoe@mail.com'})
    @Column({ type: String })
    email: string;

    @Type(() => String)
    @IsString()
    @Length(6, 60)
    @ApiProperty({
        description: 'пароль',
        example: '123qwerty',
        writeOnly: true, // содержится в запросах, но не в ответах
    })
    @Column({ type: String })
    password: string;

    @ApiProperty({
        description: 'Профиль пользователя',
        type: Profile,
    })
    @OneToOne(
        () => Profile,
        (profile) => profile.user,
        { eager: true }
    )
    profile: Profile;

    @ApiProperty({
        description: 'Роли пользователя',
        type: UserRole,
    })
    @OneToMany(
        () => UserRole,
        (userRole) => userRole.user,
        { eager: true }
    )
    userRoles: UserRole[];  // какие у него самого роли?

    @OneToMany(
        () => UserRole,
        (userRole) => userRole.grantedBy,
    )
    creatures: UserRole[];  // кому это он банхамер доверил?


    // вместе с @Exclude на колнке пароля достаточно, чтобы не возвращать пароли в ответе
    toJSON() {
        const record = instanceToPlain(this);
        delete record.password;
        return record;
    }

    async setPassword(password: string, hash: number = 10) {
        this.password = await bcrypt.hash(password, hash);
    }

    async checkPassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
} 