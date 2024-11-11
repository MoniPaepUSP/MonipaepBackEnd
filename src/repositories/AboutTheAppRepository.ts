import { DeleteResult, Like, NoConnectionForRepositoryError, Repository, UpdateResult } from 'typeorm'
import { AboutTheApp } from '../models'
import { AppDataSource } from 'src/database'
import { BadImplementedError, ConnectionError } from '../errors/databaseErrors'
import { ICreateAboutTheApp } from 'src/interfaces/about-the-app.interface'

export class AboutTheAppRepository {
  private readonly dbRepository: Repository<AboutTheApp>

  constructor() {
    this.dbRepository = AppDataSource.getRepository(AboutTheApp)
  }

  async listAbout(
    search: string
  ): Promise<{ content: AboutTheApp[]; totalContent: number }> {
    try {
      const [content, totalContent] = await this.dbRepository.findAndCount({
        where: {
          main: Like(`%${String(search)}%`),
        },
        order: {
          main: 'ASC',
        },
      })

      return { content, totalContent }
    } catch (error) {
      if (error instanceof NoConnectionForRepositoryError) {
        throw new ConnectionError()
      }

      throw new BadImplementedError()
    }
  }

  async getAboutByMain(main: string): Promise<AboutTheApp> {
    try {
      const getAboutContent = await this.dbRepository.findOne({
        where: {
          main,
        },
      })

      return getAboutContent
    } catch (error) {
      if (error instanceof NoConnectionForRepositoryError) {
        throw new ConnectionError()
      }

      throw new BadImplementedError()
    }
  }

  async createNewAboutContent(
    aboutContent: ICreateAboutTheApp
  ): Promise<AboutTheApp> {
    try {
      const aboutEntity = this.dbRepository.create(aboutContent)
      const saveEntity = await this.dbRepository.save(aboutEntity)

      return saveEntity
    } catch (error) {
      if (error instanceof NoConnectionForRepositoryError) {
        throw new ConnectionError()
      }

      throw new BadImplementedError()
    }
  }

  async getAboutById(id: string): Promise<AboutTheApp> {
    try {
      const getAboutContent = await this.dbRepository.findOne({
        where: {
          id,
        },
      })

      return getAboutContent
    } catch (error) {
      if (error instanceof NoConnectionForRepositoryError) {
        throw new ConnectionError()
      }

      throw new BadImplementedError()
    }
  }

  async deleteAboutInfo(id: string): Promise<DeleteResult> {
    try {
      const deleteAbout = await this.dbRepository.delete({ id })
      return deleteAbout
    } catch (error) {
      if (error instanceof NoConnectionForRepositoryError) {
        throw new ConnectionError()
      }

      throw new BadImplementedError()
    }
  }

  async updateAboutInfo(
    id: string,
    updateBody: ICreateAboutTheApp
  ): Promise<UpdateResult> {
    try {
      const updateAbout = await this.dbRepository.update({ id }, updateBody)
      return updateAbout
    } catch (error) {
      if (error instanceof NoConnectionForRepositoryError) {
        throw new ConnectionError()
      }

      throw new BadImplementedError()
    }
  }
}
