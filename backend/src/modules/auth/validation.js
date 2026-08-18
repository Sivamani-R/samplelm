import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});
