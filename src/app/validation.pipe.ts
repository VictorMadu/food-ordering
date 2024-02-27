/* eslint-disable @typescript-eslint/ban-types */
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { deserialize } from 'src/lib/deserialize';
import { validateAsync } from 'src/lib/validiate-async';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { type, metatype }: ArgumentMetadata) {
    if (type === 'custom') return value;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    if (value?.constructor === metatype) return value;

    const obj = deserialize(value, metatype);

    await validateAsync(obj);

    return obj;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
