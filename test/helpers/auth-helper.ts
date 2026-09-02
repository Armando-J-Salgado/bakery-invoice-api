import { JwtService } from '@nestjs/jwt';

export class AuthHelper {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService({
      secret: process.env.JWT_SECRET || 'test-secret-key',
      signOptions: { expiresIn: '1h' },
    });
  }

  async generateToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async generateAdminToken(): Promise<string> {
    return this.generateToken({
      email: 'admin@test.com',
      sub: 1,
      role: 'Admin',
    });
  }

  async generateUserToken(
    userId: number = 1,
    email: string = 'user@test.com',
  ): Promise<string> {
    return this.generateToken({
      email,
      sub: userId,
      role: 'User',
    });
  }
}
