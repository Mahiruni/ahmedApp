export async function GET() {
  return Response.json({
    service: "biloo",
    status: "ok",
    version: "0.1.0",
    capabilities: [
      "customer",
      "driver",
      "vendor",
      "admin",
      "food",
      "taxi",
      "market",
      "construction",
      "car-parts",
    ],
  });
}
