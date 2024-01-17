interface Env {}

const errorHandling: PagesFunction<Env> = async (context) => {
  try {
    return await context.next();
  } catch (err: any) {
    console.error("Error occurred.", err);
    return new Response(`Error occurred.`, { status: 500 });
  }
};

export const onRequest = [errorHandling];
