module.exports = (sequelize, DataTypes) => {
  const LoginStatus = sequelize.define('LoginStatus', {
    uidLoginStatus: {
      field: 'uid_login_status',
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uidAdministrationAccount: {
      field: 'uid_administration_account',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    loggedIn: {
      field: 'logged_in',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastUpdate: {
      field: 'last_update',
      type: DataTypes.DATE,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'login_status',
    timestamps: true,
  });

  return LoginStatus;
};
