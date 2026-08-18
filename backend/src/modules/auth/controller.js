import { authService } from './service.js';
import { loginSchema } from './validation.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Client side clears token. Server side can invalidate token if we implement a denylist, but standard JWT is stateless.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const profile = await authService.getProfile(userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};
