import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupDevelopmentDocs(app: INestApplication): void {
  if (process.env.NODE_ENV !== 'development') return;
  const config = new DocumentBuilder().setTitle('POS API').setVersion('1').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' });
}
