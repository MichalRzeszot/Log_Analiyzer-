/**
 * User Repository - Data access layer for User entity
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { NotFoundError, DatabaseError } from '../utils/errors';
import logger from '../utils/logger';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      logger.error(`Error finding user by ID ${id}:`, error);
      throw new DatabaseError('Failed to find user');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { email } });
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw new DatabaseError('Failed to find user');
    }
  }

  /**
   * Create new user
   */
  async create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    try {
      const user = this.repository.create({
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        role: 'user',
        isActive: true,
      });
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new DatabaseError('Failed to create user');
    }
  }

  /**
   * Update user
   */
  async update(id: number, data: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }
      Object.assign(user, data);
      return await this.repository.save(user);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error updating user ${id}:`, error);
      throw new DatabaseError('Failed to update user');
    }
  }

  /**
   * Get all users with pagination
   */
  async getAll(page: number = 1, limit: number = 10): Promise<[User[], number]> {
    try {
      const skip = (page - 1) * limit;
      return await this.repository.findAndCount({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw new DatabaseError('Failed to fetch users');
    }
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw new DatabaseError('Failed to delete user');
    }
  }

  /**
   * Deactivate user
   */
  async deactivate(id: number): Promise<User> {
    return this.update(id, { isActive: false });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: { email } });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking if email exists ${email}:`, error);
      throw new DatabaseError('Failed to check email');
    }
  }
}

export default new UserRepository();
