import { Injectable } from '@nestjs/common';
import {PrismaService} from "./prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello() {
    const a = await this.prisma.user.findMany({
      where:{}
    })
    console.log(a)
    return 'Hello World!zt';
  }
}
