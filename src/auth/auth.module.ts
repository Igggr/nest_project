import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ProfileModule } from 'src/profile/profile.module';
import { RolesModule } from 'src/roles/roles.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';


@Module({})
export class AuthModule {

  static forRoot(secret: string): DynamicModule {
    return {
      controllers: [AuthController],
      imports: [
        ProfileModule,
        UserModule,
        RolesModule,
        JwtModule.register({
          secret,
          signOptions: {
            expiresIn: '24h'
          }
        })
      ],
      providers: [
        AuthService,
      ],
      module: AuthModule
    }
  }
}