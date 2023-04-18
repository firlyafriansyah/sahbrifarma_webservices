module.exports = (sequelize, DataTypes) => {
  const MedicalTest = sequelize.define('MedicalTest', {
    id: {
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
    bodyHeight: {
      field: 'body_height',
      type: DataTypes.INTEGER,
    },
    bodyWeight: {
      field: 'body_weight',
      type: DataTypes.INTEGER,
    },
    bloodPreasure: {
      field: 'blood_preasure',
      type: DataTypes.STRING,
    },
    bloodSugar: {
      field: 'blood_sugar',
      type: DataTypes.INTEGER,
    },
    uricAcid: {
      field: 'uric_acid',
      type: DataTypes.INTEGER,
    },
    cholesterol: {
      type: DataTypes.INTEGER,
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
    tableName: 'medical_test',
    timestamps: true,
  });

  return MedicalTest;
};
