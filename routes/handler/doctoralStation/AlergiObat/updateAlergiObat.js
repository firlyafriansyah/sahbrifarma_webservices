const { AlergiObat, RiwayatBerobat, Pasien } = require('../../../../models');
const Validator = require("fastest-validator")
const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    nama_obat: 'string|empty:false',
    admin: 'string|empty:false'
  }

  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(400).json({
      status: 'error',
      message: validate
    })
  }

  const id = req.params.id;
  const alergiObat = await AlergiObat.findOne({
    where: {id_pasien: id}
  })
  if (!alergiObat) {
    return res.status(404).json({
      status: 'error',
      message: 'Data tidak ditemukan!'
    })
  }

  const dataRiwayatBerobat = {
    id_pasien: id,
    tanggal_berobat: new Date(),
    admin: req.body.admin,
    action: 'Update Alergi Obat',
  }

  await RiwayatBerobat.create(dataRiwayatBerobat);

  const { nama_obat } = req.body;

  const pasien = await Pasien.findOne({
      where: {id}
  })

  await pasien.update({ tanggal_berobat_terakhir	: new Date() });

  await alergiObat.update({nama_obat})

  return res.json({
    status: 'success',
    message: {
      id_pasien: alergiObat.id_pasien,
      nama_obat
    }
  })
  
}