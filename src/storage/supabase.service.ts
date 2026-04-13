import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName: string;
  private readonly logger = new Logger(SupabaseService.name);

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }

    if (!supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or fallback SUPABASE_ANON_KEY) environment variable');
    }

    this.supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );
    this.bucketName = process.env.SUPABASE_BUCKET_NAME || 'uploads';
  }

  async uploadFile(file: Express.Multer.File, fileName?: string): Promise<string> {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException('No file provided for upload');
      }

      // Generate unique filename if not provided
      const uploadFileName = this.normalizeFileName(fileName || `${Date.now()}-${file.originalname}`);
      
      this.logger.log(`Uploading file: ${uploadFileName} to bucket: ${this.bucketName}`);
      
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(uploadFileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        this.logger.error(`Supabase upload error: ${error.message}`, error.stack);
        throw new InternalServerErrorException(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(uploadFileName);

      this.logger.log(`File uploaded successfully: ${data?.path ?? uploadFileName}`);
      return publicUrl;
    } catch (error) {
      this.logger.error('Upload error', (error as Error)?.stack || String(error));
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to upload file: ${(error as Error)?.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

      if (error) {
        this.logger.error(`Supabase delete error: ${error.message}`, error.stack);
        return false;
      }

      this.logger.log(`File deleted successfully: ${fileName}`);
      return true;
    } catch (error) {
      this.logger.error('Delete error', (error as Error)?.stack || String(error));
      return false;
    }
  }

  getPublicUrl(fileName: string): string {
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  extractFileNameFromUrl(url: string): string {
    // Extract filename from Supabase URL
    const marker = `/object/public/${this.bucketName}/`;
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
      const urlParts = url.split('/');
      return decodeURIComponent(urlParts[urlParts.length - 1]);
    }

    return decodeURIComponent(url.substring(markerIndex + marker.length));
  }

  // Helper method to get file info
  async getFileInfo(fileName: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list('', {
          search: fileName,
          limit: 1
        });

      if (error) {
        this.logger.error(`Get file info error: ${error.message}`, error.stack);
        return null;
      }

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      this.logger.error('Get file info error', (error as Error)?.stack || String(error));
      return null;
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        this.logger.error(`Supabase connection test failed: ${error.message}`, (error as Error)?.stack);
        return false;
      }

      this.logger.log(`Supabase connection successful. Available buckets: ${data?.map((b) => b.name).join(', ')}`);
      return true;
    } catch (error) {
      this.logger.error('Supabase connection test error', (error as Error)?.stack || String(error));
      return false;
    }
  }

  private normalizeFileName(fileName: string): string {
    const parts = fileName.split('/').filter(Boolean);
    const normalizedParts = parts.map((segment) =>
      segment
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, ''),
    );

    return normalizedParts.join('/');
  }
}