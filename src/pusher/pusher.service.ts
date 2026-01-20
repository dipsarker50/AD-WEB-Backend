import { Injectable } from '@nestjs/common';
import Pusher from 'pusher';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(private configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.get('PUSHER_APP_ID')!,
      key: this.configService.get('PUSHER_KEY')!,
      secret: this.configService.get('PUSHER_SECRET')!,
      cluster: this.configService.get('PUSHER_CLUSTER')!,
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: any) {
    await this.pusher.trigger(channel, event, data);
  }
}
