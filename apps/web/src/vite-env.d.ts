// Next.js environment variable types
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
    NEXT_PUBLIC_UPLOAD_PRESET: string;
  }
}
