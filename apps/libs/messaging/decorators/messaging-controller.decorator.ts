import {
  EnsureParentImports,
  ExternalContextType,
  Injectable,
  UseExternalContext,
} from '@libs/discovery';
import { MessagingModule } from '@libs/messaging/messaging.module';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { ILogger } from '@libs/logger/logger.interface';
import { MessagingParamsFactory } from '@libs/messaging/installer/messaging.installer';

import { applyDecorators } from '@libs/discovery/utils';
import { LazyLoaderModule } from '@libs/lazy-loader/lazy-loader.module';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';

export const MessagingController = () =>
  applyDecorators(
    UseExternalContext(MessagingParamsFactory),
    ExternalContextType('messaging'),
    Injectable({
      inject: {
        logger: ILogger,
        lazy: ILazyLoaderService,
        messagingConfig: MessagingConfiguration,
        connections: 'MESSAGING_CONNECTIONS',
      },
    }),
    EnsureParentImports(MessagingModule, LazyLoaderModule),
  );
