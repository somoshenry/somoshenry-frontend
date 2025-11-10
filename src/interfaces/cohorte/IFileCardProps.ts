export interface IFileCardProps {
  name: string;
  description: string;
  uploadedAt: string;
  type: string; // "doc", "word", "video", "image", code, folder, etc.
  url: string;
}

export default IFileCardProps;
