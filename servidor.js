const express = require('express');
const cors = require('cors');

const app = express();
const PORTA = process.env.PORT || 3000;
const GOOGLE_MAPS_API_KEY = process.env.MAPS_KEY || 'SUA_API_KEY_AQUI';

// Middleware básicos
app.use(express.json());
app.use(cors());

// Base de dados simulada na memória (Array)
let baseDados = [
  { id: 1, origem: 'Viana', destino: 'Mutamba', status: 'pendente', cliente: 'Carlos' },
  { id: 2, origem: 'Talatona', destino: 'Cazenga', status: 'pendente', cliente: 'Maria' }
];

// Função simulada para apanhar o motorista logado
function motoristaDaSessao(req) {
  // Retorna um motorista fictício para teste se não houver autenticação real montada
  return { id: 101, nome: 'Mateus Motorista' };
}

// ── ROTAS DO SERVIDOR ──────────────────────────────────────

// Rota para listar pedidos pendentes (Gera a interface simples)
app.get('/pedidos', (req, res) => {
  let htmlPedidos = '';
  
  const pendentes = baseDados.filter(p => p.status === 'pendente');
  
  if (pendentes.length === 0) {
    htmlPedidos = '<p class="text-white/60">Nenhum pedido pendente no momento.</p>';
  } else {
    pendentes.forEach(p => {
      htmlPedidos += `
        <div class="bg-slate-800 p-4 rounded-xl mb-3 border border-white/5 flex justify-between items-center">
          <div>
            <p class="font-bold text-yellow-500">${p.cliente}</p>
            <p class="text-xs text-slate-300">De: ${p.origem} -> Para: ${p.destino}</p>
          </div>
          <button onclick="aceitarPedido(${p.id})" class="bg-yellow-500 text-black text-xs font-bold px-3 py-2 rounded-lg hover:bg-yellow-400">
            Aceitar
          </button>
        </div>
      `;
    });
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Painel do Motorista</title>
      <script>
        function aceitarPedido(id) {
          fetch('/aceitar/' + id)
            .then(res => {
              if(res.ok) {
                alert('Pedido aceite com sucesso!');
                window.location.reload();
              } else {
                alert('Erro ao aceitar pedido.');
              }
            });
        }
      </script>
    </head>
    <body class="bg-black text-white p-6">
      <div class="max-w-md mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-black">Cargas Disponíveis</h2>
          <span class="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full font-bold">Pendentes</span>
        </div>
        <div style="max-w:520px">${htmlPedidos}</div>
      </div>
    </body>
    </html>
  `);
});

// ROTA — Marcar pedido como aceite (AJAX simples)
app.get('/aceitar/:id', (req, res) => {
  const motorista = motoristaDaSessao(req);
  if (!motorista) return res.sendStatus(401);
  
  const pedido = baseDados.find(p => p.id == req.params.id);
  if (pedido) {
    pedido.status = 'aceite';
    console.log(`📦 Pedido ${req.params.id} foi aceite pelo motorista: ${motorista.nome}`);
    return res.sendStatus(200);
  }
  res.sendStatus(404);
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORTA, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════╗');
  console.log('║      UBER CARGA — ONLINE ✅       ║');
  console.log(`║  http://localhost:${PORTA}           ║`);
  console.log('╚══════════════════════════════════╝\n');
  if (GOOGLE_MAPS_API_KEY === 'SUA_API_KEY_AQUI') {
    console.log('⚠️  ATENÇÃO: Configure a variável MAPS_KEY com a sua Google Maps API Key');
    console.log('   Exemplo: MAPS_KEY=AIza... node servidor.js\n');
  }
});
