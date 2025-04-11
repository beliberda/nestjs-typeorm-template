import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "users/users.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.PRIVATE_KEY,
        signOptions: { expiresIn: "14d" },
      }),
    }),
  ],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
