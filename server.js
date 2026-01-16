const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let tournamentQueue = []; // Turnuva bekleyenler
let activeMatches = {};   // Aktif maçlar

io.on('connection', (socket) => {
    socket.on('joinTournament', (data) => {
        tournamentQueue.push({ id: socket.id, name: data.name });
        console.log(`Turnuvaya katılım: ${data.name}`);

        if (tournamentQueue.length >= 2) {
            const p1 = tournamentQueue.shift();
            const p2 = tournamentQueue.shift();
            const roomId = `match_${p1.id}`;

            p1.side = 'p1'; p2.side = 'p2';
            activeMatches[roomId] = { p1, p2, scores: { p1: 0, p2: 0 }, balls: [] };

            io.to(p1.id).emit('tournamentStart', { opponent: p2.name, side: 'p1', round: 'YARI FİNAL' });
            io.to(p2.id).emit('tournamentStart', { opponent: p1.name, side: 'p2', round: 'YARI FİNAL' });
        }
    });

    socket.on('disconnect', () => {
        tournamentQueue = tournamentQueue.filter(p => p.id !== socket.id);
    });
});

server.listen(process.env.PORT || 3000);
