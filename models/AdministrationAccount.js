module.exports = (sequelize, DataTypes) => {
  const AdministrationAccount = sequelize.define('AdministrationAccount', {
    uidAdministrationAccount: {
      field: 'uid_administration_account',
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(20),
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
    fullname: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    sex: {
      type: DataTypes.ENUM,
      values: ['Laki - Laki', 'Perempuan'],
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'inactive'],
      defaultValue: 'active',
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
