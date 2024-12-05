import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CreateCourseUseCase } from '../../application/use-case/course/create-course.use-case';
import { AddModuleUseCase } from '../../application/use-case/modules/add-module.use-case';
import { AddLessonUseCase } from '../../application/use-case/lesson/add-lesson.use-case';
import { CreateCourseDto } from '../../application/dtos/create.course.dto';
import { ModuleDto } from '../../application/dtos/create-module.dto';
import { ILesson } from '@shared/types/ICourse';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly addModuleUseCase: AddModuleUseCase,
    private readonly addLessonUseCase: AddLessonUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear un nuevo curso' })
  @ApiResponse({
    status: 201,
    description: 'Curso creado con éxito.',
    schema: {
      example: {
        status: 'success',
        message: 'Curso creado con éxito',
        data: {
          id: '60d0fe4f5311236168a109ca',
          title: 'Curso de Desarrollo Web con NestJS',
          description:
            'Este curso cubre los conceptos básicos y avanzados de NestJS.',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en la validación de datos.',
    schema: {
      example: {
        status: 'error',
        message: 'Datos inválidos',
        errors: [
          { field: 'title', message: 'El título es obligatorio' },
          { field: 'price', message: 'El precio debe ser mayor a 0' },
        ],
      },
    },
  })
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    try {
      const course = await this.createCourseUseCase.execute(createCourseDto);
      return {
        status: 'success',
        message: 'Curso creado con éxito',
        data: course,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          {
            status: 'error',
            message: 'No se pudo crear el curso',
            details: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'No se pudo crear el curso',
          details: 'Ocurrió un error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':courseId/modules')
  @HttpCode(201)
  @ApiOperation({ summary: 'Agregar un módulo a un curso existente' })
  @ApiResponse({
    status: 201,
    description: 'Módulo agregado con éxito.',
    schema: {
      example: {
        status: 'success',
        message: 'Módulo agregado con éxito',
        data: {
          id: '60d0fe4f5311236168a109cb',
          title: 'Módulo 1: Introducción',
          description: 'Descripción del módulo',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Curso no encontrado.',
    schema: {
      example: {
        status: 'error',
        message: 'Curso no encontrado',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en la validación de datos del módulo.',
    schema: {
      example: {
        status: 'error',
        message: 'Datos inválidos',
        errors: [
          { field: 'title', message: 'El título del módulo es obligatorio' },
        ],
      },
    },
  })
  async addModule(
    @Param('courseId') courseId: string,
    @Body() ModuleDto: ModuleDto,
  ) {
    try {
      const module = await this.addModuleUseCase.execute(courseId, ModuleDto);
      return {
        status: 'success',
        message: 'Módulo agregado con éxito',
        data: module,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          {
            status: 'error',
            message: 'No se pudo agregar el módulo',
            details: error.message,
          },
          error instanceof NotFoundException
            ? HttpStatus.NOT_FOUND
            : HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'No se pudo agregar el módulo',
          details: 'Ocurrió un error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post(':courseId/modules/:moduleId/lessons')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar una lección a un módulo existente' })
  @ApiResponse({
    status: 201,
    description: 'Lección agregada con éxito.',
    schema: {
      example: {
        status: 'success',
        message: 'Lección agregada con éxito',
        data: {
          id: '60d0fe4f5311236168a109cc',
          title: 'Introducción a NestJS',
          content: 'Esta es la primera lección.',
          videoUrl: 'http://example.com/video.mp4',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Curso o módulo no encontrado.',
    schema: {
      example: {
        status: 'error',
        message: 'Curso o módulo no encontrado',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en la validación de datos de la lección.',
    schema: {
      example: {
        status: 'error',
        message: 'Datos inválidos',
        errors: [
          { field: 'title', message: 'El título de la lección es obligatorio' },
        ],
      },
    },
  })
  async addLesson(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() lessonData: Omit<ILesson, '_id'>, // Datos de la nueva lección
  ) {
    try {
      const lesson = await this.addLessonUseCase.execute(
        courseId,
        moduleId,
        lessonData,
      );
      return {
        status: 'success',
        message: 'Lección agregada con éxito',
        data: lesson,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          {
            status: 'error',
            message: 'No se pudo agregar la lección',
            details: error.message,
          },
          error instanceof NotFoundException
            ? HttpStatus.NOT_FOUND
            : HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'No se pudo agregar la lección',
          details: 'Ocurrió un error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
