import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API HoQuocThang')
    .setDescription('API description')
    .setVersion('v1.1')
    .addServer('http://localhost:8888', 'Local server')
    .addServer('https://hoquocthang.vercel.app', 'Production server')
    .addSecurityRequirements('bearer')
    .addBearerAuth()
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scopes: {
              openid: 'Use OpenID Connect',
              profile: 'Read your profile info',
              email: 'Read your email address',
            },
          },
        },
      },
      'googleAuth', // <-- tên scheme, dùng ở bước 2
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document, {
    jsonDocumentUrl: 'https://api-pharmacy.vercel.app/swagger/v1/swagger.json',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui.css',
    ],
    swaggerOptions: {
      oauth2RedirectUrl: process.env.GOOGLE_REDIRECT_URI,
      oauth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        usePkceWithAuthorizationCodeGrant: true,
        scopes: ['openid', , 'email', 'profile'],
      },
    },
  });
}
