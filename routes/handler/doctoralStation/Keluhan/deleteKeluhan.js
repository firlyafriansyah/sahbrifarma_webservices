const { Keluhan, RiwayatBerobat, Pasien } = require("../../../../models");

module.exports = async (req, res) => {

  const id = req.params.id
  
  const keluhan = await Keluhan.findOne({
    where: {id: id}
  })

  if (!keluhan) {
    return res.status(404).json({
      status: 'error',
      message: 'Data tidak ditemukan!'
    })
  }

  const dataRiwayatBerobat = {
    id_pasien: req.body.idPasien,
    tanggal_berobat: new Date(),
    admin: req.body.admin,
    action: 'Hapus Keluhan'
  }

  const pasien = await Pasien.findOne({
      where: {id: req.body.idPasien}
  })

  await pasien.update({ tanggal_berobat_terakhir	: new Date() });

  await RiwayatBerobat.create(dataRiwayatBerobat);
  
  await keluhan.destroy();

  return res.json({
    status: 'success',
    keluhan,
  });
};
