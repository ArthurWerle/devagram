import { FileData } from "aws-multipart-parser/dist/models"

export type FormData = {
  file: FileData
  name: string 
  email: string 
  password: string
}