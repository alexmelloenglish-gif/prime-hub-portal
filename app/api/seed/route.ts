export async function GET() {
  return new Response('Seed endpoint disabled. Use the protected offline seed procedure.', {
    status: 410,
    headers: { 'cache-control': 'no-store' },
  })
}
