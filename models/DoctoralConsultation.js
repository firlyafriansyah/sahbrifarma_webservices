module.exports = (sequelize, DataTypes) => {
  const DoctoralConsultation = sequelize.define('DoctoralConsultation', {
    uid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING,
      allowNull: false,
    },
    allergies: {
      type: DataTypes.STRING,
    },
    anamnesis: {
      type: DataTypes.STRING,
    },
    diagnosis: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.STRING,
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
