import bank from "./bank";

interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  return Response.json((bank as any)[context.params.type.toString()]);
};
