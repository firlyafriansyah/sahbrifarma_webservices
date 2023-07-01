module.exports = (sequelize, DataTypes) => {
  const VisitHistory = sequelize.define('VisitHistory', {
    uidVisitHistory: {
      field: 'uid_visit_history',
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING(14),
      allowNull: false,
    },
    uidMedicalType: {
      field: 'uid_medical_type',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uidMedicineRequest: {
      field: 'uid_medicine_request',
      type: DataTypes.INTEGER,
    },
    visitDate: {
      field: 'visit_date',
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    medicalType: {
      field: 'medical_type',
      type: DataTypes.ENUM,
      values: ['Periksa Kesehatan', 'Konsultasi Dan Periksa Kesehatan Lanjutan', 'Beli Obat'],
      defaultValue: 'Periksa Kesehatan',
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
    tableName: 'visit_history',
    timestamps: true,
  });

  return VisitHistory;
};
