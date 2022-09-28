import { createRouter } from 'server/createRouter';

export const w3bstreamRouter = createRouter().query('projects', {
  async resolve({ ctx, input }) {
    return ctx.prisma.t_project.findMany({
      select: {
        f_project_id: true,
        f_name: true,
        f_version: true,
        applets: {
          select: {
            f_name: true,
            f_applet_id: true,
            instances: {
              select: {
                f_instance_id: true,
                f_state: true
              }
            }
          }
        }
      }
    });
  }
});
