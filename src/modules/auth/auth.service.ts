import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SafeUser, User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

export interface AuthResult {
  message: string;
  user: SafeUser;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResult> {
    const { email, name, password } = signUpDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await this.usersService.create({
      email,
      name,
      passwordHash,
    });

    const accessToken = await this.generateToken(newUser);

    return {
      message: 'User registered successfully',
      user: this.usersService.sanitizeUser(newUser),
      accessToken,
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResult> {
    const { email, password } = signInDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(user);

    return {
      message: 'Signed in successfully',
      user: this.usersService.sanitizeUser(user),
      accessToken,
    };
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload);
  }
}
