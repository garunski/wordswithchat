interface Env {
  WORDSWITHCHAT_SCORE: KVNamespace;
}

const post: PagesFunction<Env> = async (context) => {
  const userId = context.data.userId as string;
  const score = await context.env.WORDSWITHCHAT_SCORE.get(userId);
  let newScore = 1;

  if (score) {
    newScore += Number(score);
  }

  await context.env.WORDSWITHCHAT_SCORE.put(userId, newScore.toString());

  return Response.json({ score: newScore });
};

const get: PagesFunction<Env> = async (context) => {
  const userId = context.data.userId as string;

  const score = await context.env.WORDSWITHCHAT_SCORE.get(userId);

  let returnedScore = 0;
  if (score) {
    returnedScore += Number(score);
  }

  return Response.json({ score: returnedScore });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  switch (context.request.method) {
    case "GET":
      return get(context);
    case "POST":
      return post(context);
    default:
      return new Response("", { status: 404, statusText: "Not Found." });
  }
};
