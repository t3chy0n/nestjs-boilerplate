import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {Traced} from "@libs/telemetry/decorators/traced.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /***
   * Health check endpoint
   */
  @Get()
  getHealth() {
    return this.appService.getHello("tesT");
  }
}
