import { Context } from './context';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  }
});

export const getUserFromHeader = async (req: NextApiRequest) => {
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const user = await jwt.verify(token, process.env.JWT_SIGN_KEY, { algorithms: ['HS256'] });
      return user;
    } catch (error) {
      return null;
    }
  }
  return null;
};

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const user = await getUserFromHeader(ctx.req);

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const exp = new Date(user.exp * 1000);
  if (exp.getTime() < Date.now()) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      user
    }
  });
});

export const authProcedure = t.procedure.use(authMiddleware);
