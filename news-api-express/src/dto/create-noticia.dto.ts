import { 
  IsString, 
  IsUrl, 
  IsArray, 
  ArrayNotEmpty, 
  IsOptional 
} from 'class-validator';

export class CreateNoticiaDto {
  
  @IsString()
  titulo!: string; 

  @IsString()
  descripcion!: string; 

  @IsUrl()
  @IsOptional()
  imagenUrl?: string; 

  @IsUrl()
  noticiaUrl!: string; 

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keywords!: string[]; 
}