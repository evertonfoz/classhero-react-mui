import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro interno do servidor';

    const finalMessage =
      typeof message === 'string'
        ? message
        : Array.isArray(message['message'])
        ? message['message'].join(', ')
        : message['message'] || 'Erro inesperado.';

    response.status(status).json({
      statusCode: status,
      message: finalMessage,
    });
  }
}
