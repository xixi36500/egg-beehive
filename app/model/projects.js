'use strict';
module.exports = app => {
  const Sequelize = app.Sequelize;

  const project = app.model.define(
    'projects',
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: Sequelize.STRING(255),
      parent_id: Sequelize.INTEGER(11),
      manager_id: Sequelize.INTEGER(11),
      project_template_id: Sequelize.INTEGER(11),
      progress: Sequelize.INTEGER(11),
      cover: Sequelize.STRING(255),
      is_recycle: Sequelize.TINYINT(1),
      is_archived: Sequelize.TINYINT(1),
      is_private: Sequelize.TINYINT(1),
      is_auto_progress: Sequelize.TINYINT(1),
      state: Sequelize.TINYINT(1),
      intro: Sequelize.STRING(255),
    },
    {}
  );

  project.addHook('afterUpdate', async (project, options) => {
    const ctx = await app.createAnonymousContext();
    ctx.helper.sendSocketToClientOfRoom(project, 'update:project', project.id);
  });
  project.addHook('afterDestroy', async (project, options) => {
    const ctx = await app.createAnonymousContext();
    ctx.helper.sendSocketToClientOfRoom(project, 'delete:project', project.id);
  });

  project.associate = function(models) {
    // associations can be defined here
    project.hasOne(app.model.Users, { foreignKey: 'id', sourceKey: 'manager_id', as: 'creator' });
    app.model.Projects.belongsToMany(app.model.Users, {
      through: app.model.UserProjects,
      foreignKey: 'project_id',
      otherKey: 'user_id',
      as: 'member',
    });
    app.model.Projects.belongsToMany(app.model.Users, {
      through: app.model.UserProjectCollects,
      foreignKey: 'project_id',
      otherKey: 'user_id',
      as: 'collector',
    });
  };
  return project;
};
