// Type stub for class-validator (backend-only dependency)
// This allows the web app to compile shared library DTOs that import class-validator
// without actually needing the package installed

declare module 'class-validator' {
  // Export all common decorators as PropertyDecorator
  export function IsString(options?: any): PropertyDecorator;
  export function IsNotEmpty(options?: any): PropertyDecorator;
  export function IsOptional(options?: any): PropertyDecorator;
  export function IsNumber(options?: any): PropertyDecorator;
  export function IsEnum(entity: any, options?: any): PropertyDecorator;
  export function IsArray(options?: any): PropertyDecorator;
  export function IsBoolean(options?: any): PropertyDecorator;
  export function IsDate(options?: any): PropertyDecorator;
  export function Length(min: number, max?: number, options?: any): PropertyDecorator;
  export function Min(min: number, options?: any): PropertyDecorator;
  export function Max(max: number, options?: any): PropertyDecorator;
  export function ArrayMinSize(min: number, options?: any): PropertyDecorator;
  export function ArrayMaxSize(max: number, options?: any): PropertyDecorator;
  export function IsEmail(options?: any): PropertyDecorator;
  export function Matches(pattern: RegExp, options?: any): PropertyDecorator;
  export function ValidateNested(options?: any): PropertyDecorator;
  export function IsUUID(version?: string, options?: any): PropertyDecorator;
  export function IsInt(options?: any): PropertyDecorator;
  export function IsPositive(options?: any): PropertyDecorator;
  export function IsNegative(options?: any): PropertyDecorator;
  export function IsDateString(options?: any): PropertyDecorator;
  export function IsDefined(options?: any): PropertyDecorator;
  export function IsNotEmptyObject(options?: any): PropertyDecorator;
  export function IsObject(options?: any): PropertyDecorator;
  export function IsIn(values: any[], options?: any): PropertyDecorator;
  export function IsNotIn(values: any[], options?: any): PropertyDecorator;
  export function IsUrl(options?: any): PropertyDecorator;
}

