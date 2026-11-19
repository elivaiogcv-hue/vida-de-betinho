# VIDA & IMPÉRIO

Protótipo web funcional de um jogo de mundo aberto, economia e empreendedorismo.

## Executar

Abra `index.html` diretamente no navegador ou sirva a pasta:

```bash
python3 -m http.server 4173
```

Depois aceda a `http://localhost:4173`.

## Protótipo incluído

- Cidade explorável com personagem controlado por teclado
- Ciclo visual e NPCs animados
- Carteira virtual persistente na sessão
- Marketplace com preços dinâmicos
- Inventário
- Compras e empregos
- Banco e propriedades
- Criação de empresa
- Sistema de progressão por experiência
- Interface preparada para expansão multiplayer

## Próxima arquitetura recomendada

1. React/Vite ou Unreal Engine para a interface e renderização avançada
2. API REST/WebSocket para contas e transações
3. PostgreSQL para estados persistentes
4. Photon Fusion ou serviço dedicado para movimento multiplayer
5. PlayFab para autenticação, economia e operações de servidor

As transações de produção devem ser validadas pelo servidor; este protótipo não implementa segurança econômica real.
