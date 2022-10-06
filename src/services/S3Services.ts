import { FileData } from 'aws-multipart-parser/dist/models'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { allowedImageExtensions } from '../constants/Regexes'

const S3 = new AWS.S3()

export class S3Service {
  public saveImage(bucket: string, type: string, file: FileData): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        const imageId = uuid.v4()
        const extension = allowedImageExtensions.exec(file.filename) || ['']

        const key = `${type}-${imageId}${extension[0]}`

        const config = {
          Bucket: bucket,
          Key: key,
          Body: file.content
        }

        S3.upload(config, (err, res) => {
          if(err) reject(err)

          resolve(key)
        })
      } catch(error) {
        reject(error)
      }
    })
  }
}
