'use strict';
module.exports = app => {
  const Sequelize = app.Sequelize;

  const message = app.model.define(
    'messages',
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      actor_id: Sequelize.INTEGER(11),
      receiver_id: Sequelize.INTEGER(11),
      content: Sequelize.TEXT,
      is_read: Sequelize.TINYINT(1),
      type: Sequelize.STRING(30),
      url: Sequelize.STRING(255),
    },
    {}
  );

  message.addHook('afterCreate', async (message, options) => {
    const ctx = await app.createAnonymousContext();
    // 发送socket消息
    const newMessage = Object.assign(
      {
        is_read: 0,
        url: '',
      },
      message.dataValues
    );
    const nsp = app.io.of('/');
    const { receiver_id, type } = message;
    nsp.clients((error, clients) => {
      if (error) throw error;
      // 当此用户在线，则发送消息
      if (clients.includes(receiver_id.toString())) {
        const socket = nsp.sockets[receiver_id];
        ctx.helper.sendMessageToSocket(socket, newMessage, type, 'message');
      }
    });
  });

  message.associate = function(models) {
    // associations can be defined here
  };
  return message;
};
