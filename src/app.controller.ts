import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      status: 'ok',
      message: 'NestJS Authentication Server is running',
      version: '1.0.0',
    };
  }
}
