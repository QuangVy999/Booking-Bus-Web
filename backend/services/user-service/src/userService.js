import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export function createUserService(userRepository) {
  const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS) || 10;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  return {
    async register({ name, email, password }) {
      if (!name || !email || !password) {
        const err = new Error('Name, email and password are required');
        err.code = 'INVALID_ARGUMENT';
        throw err;
      }
      
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        const err = new Error('Email already exists');
        err.code = 'ALREADY_EXISTS';
        throw err;
      }

      const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
      const user = await userRepository.create({
        name,
        email,
        password: passwordHash,
        role: 'Registered'
      });
      return user;
    },

    async login({ email, password }) {
      if (!email || !password) {
        const err = new Error('Email and password are required');
        err.code = 'INVALID_ARGUMENT';
        throw err;
      }

      const user = await userRepository.findByEmail(email);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        const err = new Error('Invalid email or password');
        err.code = 'UNAUTHENTICATED';
        throw err;
      }

      const token = jwt.sign(
        { sub: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { user, token };
    },

    async getProfile(id) {
      const user = await userRepository.findById(id);
      if (!user) {
        const err = new Error('User not found');
        err.code = 'NOT_FOUND';
        throw err;
      }
      return user;
    }
  };
}
