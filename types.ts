
export type Status = 'idle' | 'locating' | 'generating' | 'success' | 'error';

export interface PoemData {
  cityName: string;
  poem: string;
}
