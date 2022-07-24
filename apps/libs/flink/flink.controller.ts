import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';
import { StateFun } from 'apache-flink-statefun';

@Controller('flink')
export class FlinkController {
  constructor(private readonly stateFun: StateFun) {}

  @Get()
  async get(@Req() request, @Res() response) {
    return await this.stateFun.handle(request, response);
  }

  @Post()
  async post(@Req() request, @Res() response) {

    const res = await this.stateFun.handle(request, response);
    console.log("Called flink, res", res)
    return res;
  }

  @Put()
  async put(@Req() request, @Res() response) {
    const res = await this.stateFun.handle(request, response);
    console.log("Called flink, res", res)

    return res;
  }

  @Delete()
  async delete(@Req() request, @Res() response) {
    return await this.stateFun.handle(request, response);
  }
}
