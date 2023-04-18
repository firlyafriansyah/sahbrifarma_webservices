const { Keluhan, RiwayatBerobat, Pasien } = require("../../../../models");

module.exports = async (req, res) => {

  const id = req.params.id;

  const dataKeluhan = {
    id_pasien: id,
    keluhan: req.body.keluhan,
    tanggal_berobat: new Date()
  }

  const dataRiwayatBerobat = {
    id_pasien: id,
    tanggal_berobat: new Date(),
    admin: req.body.admin,
    action: 'Tambah Keluhan'
  }

  const pasien = await Pasien.findOne({
      where: {id}
  })

  await pasien.update({ tanggal_berobat_terakhir	: new Date() });

  await RiwayatBerobat.create(dataRiwayatBerobat);
  
  const keluhan = await Keluhan.create(dataKeluhan);

  return res.json({
    status: 'success',
    keluhan,
  });
};
