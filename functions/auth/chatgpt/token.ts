interface Env {}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return Response.json({ any: "test" });
};
