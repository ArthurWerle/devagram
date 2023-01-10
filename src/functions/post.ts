import { APIGatewayEvent, Handler } from "aws-lambda"
import {UserModel } from '../models/UserModel'
import { getUserIdFromEvent } from "../utils/authenticationHandler"
import { DefaultResponse, formatResponse } from "../utils/formatResponse"
import { S3Service } from "../services/S3Services"
import { parse } from "aws-multipart-parser"
import { FormData } from '../types/auth/FormData'
import { allowedImageExtensions } from "../constants/Regexes"
import { validateEnvVariables } from "../utils/environment"
import * as uuid from 'uuid'
import * as moment from 'moment'
import { PostModel } from "../models/PostModel"
import { logger } from "../utils/logger"

export const create: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
  try {
    const { POST_BUCKET = '', error } = validateEnvVariables(['USER_TABLE', 'POST_TABLE', 'POST_BUCKET'])
    if(error) return formatResponse(500, error)

    const userId = getUserIdFromEvent(event)
    if(!userId) return formatResponse(400, 'user not found.')

    const user = await UserModel.get({ 'cognitoId': userId })
    if(!user) return formatResponse(400, 'User not found.')

    const formData = parse(event, true)
    const { description, file } = formData as FormData

    if(file && !allowedImageExtensions.exec(file.filename)) return formatResponse(400, 'Invalid image extension.')

    const imageKey = await new S3Service().saveImage(POST_BUCKET, 'post', file)

    const post = {
      id: uuid.v4(),
      userId,
      description,
      date: moment().format(),
      image: imageKey
    }

    await PostModel.create(post)

    user.posts = user.posts + 1
    await UserModel.update(user)

    return formatResponse(200, 'Post sent with success!') 

  } catch(error) {
    logger.error('post.create: Error on create post:', error)
    return formatResponse(500, 'Error on creating post, please try again.')
  }
}

export const toggleLike: Handler = async(event: any): Promise<DefaultResponse> => {
  try {
    const { error } = validateEnvVariables(['POST_TABLE'])
    if (error) return formatResponse(500, error)

    const userId = getUserIdFromEvent(event)
    if (!userId) return formatResponse(400, 'User not found.')

    const user = await UserModel.get({ 'cognitoId': userId })
    if (!user) return formatResponse(400, "User doesn`t exists.")

    const { postId } = event.pathParameters
    const post = await PostModel.get({ id: postId })
    if (!post) {
      return formatResponse(400, 'Post not found')
    }

    const hasLiked = post.likes.some(like => like.toString() === userId)
    if (hasLiked) post.likes = post.likes.filter(like => like.toString() !== userId)
    else post.likes.push(userId)

    await PostModel.update(post)
    return formatResponse(200, 'Post like/disliked with success!') 

  } catch(error) {
    logger.error('post.toggleLike: Error on toggle like:', error)
    return formatResponse(500, 'Error on like/dislike, please try again.')
  }
}

export const postComment: Handler = async(event: any): Promise<DefaultResponse> => {
  try {
    const { error } = validateEnvVariables(['POST_TABLE'])
    if (error) return formatResponse(500, error)

    const userId = getUserIdFromEvent(event)
    if (!userId) return formatResponse(400, 'User not found.')

    const user = await UserModel.get({ 'cognitoId': userId })
    if (!user) return formatResponse(400, "User doesn't exists.")

    const { postId } = event.pathParameters
    const post = await PostModel.get({ id: postId })
    if (!post) {
      return formatResponse(400, 'Post not found')
    }

    const request = JSON.parse(event.body)
    const { commentContent } = request
    if (!commentContent) return formatResponse(400, 'Comment not found.')

    const comment = {
      userId,
      userName: user.name,
      date: moment().format(),
      content: commentContent
    }

    post.comments.push(comment)
    await PostModel.update(post)
    return formatResponse(200, 'Post commented with success!') 

  } catch(error) {
    logger.error('post.postComment: Error on commenting post:', error)
    return formatResponse(500, 'Error on comment post, please try again.')
  }
}

export const get: Handler = async(event: any): Promise<DefaultResponse> =>{
  try {
    const { error, POST_BUCKET = '' } = validateEnvVariables(['POST_BUCKET', 'POST_TABLE'])
    if (error) return formatResponse(500, error)

    const userId = getUserIdFromEvent(event)
    if (!userId) return formatResponse(400, 'User not found')

    const user = await UserModel.get({ cognitoId: userId })
    if (!user) return formatResponse(400, 'User not found')

    const { postId } = event.pathParameters
    if (!postId) return formatResponse(400, 'Post not found')

    const post = await PostModel.get({ id: postId })
    if (!post) return formatResponse(400, 'Post not found')

    post.image = await new S3Service().getImageUrl(POST_BUCKET, post.image)

    return formatResponse(200, undefined, post)
  } catch (error) {
    logger.error('post.get: Error on get post by id: ', error)
    return formatResponse(500, 'Error on retrieving posts, try again later')
  }
}