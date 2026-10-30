import http from 'node:http';

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/health' || req.url === '/') {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'barbershop-server',
        message: 'Barbershop API backend is running (Phase 1 skeleton).',
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Barbershop server running on http://localhost:${PORT}`);
});
