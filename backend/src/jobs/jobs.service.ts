import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.js';
import { Job } from './job.entity.js';
import { JobStatus } from './job-status.enum.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create({
      ...createJobDto,
      status: JobStatus.PENDING,
    });

    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(
    id: string,
    updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    const { status } = updateJobStatusDto;

    const job = await this.jobsRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status === status) {
      return job;
    }

    const validTransition = this.isValidTransition(job.status, status);

    if (!validTransition) {
      throw new ConflictException(
        `Invalid status transition from ${job.status} to ${status}`,
      );
    }

    if (job.status === JobStatus.PENDING && status === JobStatus.RUNNING) {
      const result = await this.jobsRepository
        .createQueryBuilder()
        .update(Job)
        .set({
          status: JobStatus.RUNNING,
        })
        .where('id = :id', { id })
        .andWhere('status = :currentStatus', {
          currentStatus: JobStatus.PENDING,
        })
        .execute();

      if (result.affected !== 1) {
        throw new ConflictException(
          'Job is no longer pending. Another request may have updated it.',
        );
      }

      return this.jobsRepository.findOneOrFail({
        where: { id },
      });
    }

    job.status = status;

    return this.jobsRepository.save(job);
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Job not found');
    }
  }

  private isValidTransition(
    currentStatus: JobStatus,
    nextStatus: JobStatus,
  ): boolean {
    const transitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.PENDING]: [JobStatus.RUNNING],
      [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
      [JobStatus.COMPLETED]: [],
      [JobStatus.FAILED]: [],
    };

    return transitions[currentStatus].includes(nextStatus);
  }
}