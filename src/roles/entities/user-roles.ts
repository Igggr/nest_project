import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/user/entities/user-entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role-entity";

@Entity()
export class UserRole {
    @ApiProperty({ description: 'Primary key', example: 1 })
    @PrimaryGeneratedColumn()
    id: Number;

    @Column({ type: Number })
    roleId: number;

    @Column({ type: Number })
    userId: number;

    @ManyToOne(
        () => User,
        (user) => user.userRoles,
    )
    user: User;

    @ManyToOne(
        () => Role,
        (role) => role.userRoles,
    )
    role: Role;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    grantedAt: Date;


    @ManyToOne(
        () => User,
        (user) => user.creatures,
    )
    grantedBy: User;
} 