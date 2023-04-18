module.exports = (sequelize, DataTypes) => {
  const AdministrationAccount = sequelize.define('AdministrationAccount', {
    uid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ['super-admin', 'frontdesk', 'nurse', 'doctor', 'pharmacist'],
      allowNull: false,
    },
    loggedIn: {
      field: 'logged_in',
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    tableName: 'administration_account',
    timestamps: true,
  });

  return AdministrationAccount;
};
