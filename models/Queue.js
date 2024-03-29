module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define('Queue', {
    uidQueue: {
      field: 'uid_queue',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING(14),
      allowNull: false,
    },
    patientName: {
      field: 'patient_name',
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['in_medical_test_queue', 'in_doctoral_consultation_queue', 'in_pharmacist_queue', 'out_of_queue'],
      allowNull: false,
      defaultValue: 'out_of_queue',
    },
    sex: {
      type: DataTypes.ENUM,
      values: ['Laki - Laki', 'Perempuan'],
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
    tableName: 'queue',
    timestamps: true,
  });

  return Queue;
};
