const logger = require('../utils/logger');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('joinPump', (pumpId) => {
      socket.join(`pump:${pumpId}`);
      logger.info(`Socket ${socket.id} joined pump:${pumpId}`);
    });

    socket.on('leavePump', (pumpId) => {
      socket.leave(`pump:${pumpId}`);
    });

    socket.on('joinAdmin', () => {
      socket.join('admin');
    });

    socket.on('updateQueue', async ({ pumpId, queueLength }) => {
      io.to(`pump:${pumpId}`).emit('queueUpdated', { pumpId, queueLength, updatedAt: new Date() });
    });

    socket.on('updateFuel', async ({ pumpId, fuelPercent }) => {
      io.to(`pump:${pumpId}`).emit('fuelUpdated', { pumpId, fuelAvailabilityPercent: fuelPercent, updatedAt: new Date() });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
