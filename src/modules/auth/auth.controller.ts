import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user', description: 'Authenticate a user with email and password to obtain a JWT access token' })
  @ApiResponse({ 
    status: 200, 
    type: TokenDto,
    description: 'Successfully authenticated. Returns a JWT access token.',
    schema: { example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid email format or password too short',
    schema: { example: { message: ['email must be an email', 'password must be longer than or equal to 6 characters'], error: 'Bad Request', statusCode: 400 } }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid credentials',
    schema: { example: { message: 'Invalid credentials', error: 'Unauthorized', statusCode: 401 } }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user', description: 'Logout the currently authenticated user' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully logged out',
    schema: { example: { message: 'Logged out successfully' } }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - User not authenticated',
    schema: { example: { message: 'Unauthorized', error: 'Unauthorized', statusCode: 401 } }
  })
  async logout(@Request() req) {
    return this.authService.logout();
  }
}
