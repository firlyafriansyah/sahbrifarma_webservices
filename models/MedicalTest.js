module.exports = (sequelize, DataTypes) => {
  const MedicalTest = sequelize.define('MedicalTest', {
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
    bodyHeight: {
      field: 'body_height',
      type: DataTypes.FLOAT,
    },
    bodyWeight: {
      field: 'body_weight',
      type: DataTypes.FLOAT,
    },
    bodyTemperature: {
      field: 'body_parameter',
      type: DataTypes.FLOAT,
    },
    bloodPreasure: {
      field: 'blood_preasure',
      type: DataTypes.STRING,
    },
    bloodSugar: {
      field: 'blood_sugar',
      type: DataTypes.FLOAT,
    },
    uricAcid: {
      field: 'uric_acid',
      type: DataTypes.FLOAT,
    },
    cholesterol: {
      type: DataTypes.FLOAT,
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
