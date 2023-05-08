module.exports = (sequelize, DataTypes) => {
  const DoctoralConsultation = sequelize.define('DoctoralConsultation', {
    uidDoctoralConsultation: {
      field: 'uid_doctoral_consultation',
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING(14),
      allowNull: false,
    },
    allergies: {
      type: DataTypes.STRING,
    },
    anamnesis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT('long'),
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
    tableName: 'doctoral_consultation',
    timestamps: true,
  });

  return DoctoralConsultation;
};
