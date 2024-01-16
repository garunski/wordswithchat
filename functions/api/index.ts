export function onRequest() {
  return Response.json({
    success: true,
    tasks: [
      {
        name: "Clean my room",
        slug: "clean-room",
        description: null,
        completed: false,
        due_date: "2025-01-05",
      },
      {
        name: "Build something awesome with Cloudflare Workers",
        slug: "cloudflare-workers",
        description: "Lorem Ipsum",
        completed: true,
        due_date: "2022-12-24",
      },
    ],
  });
}
