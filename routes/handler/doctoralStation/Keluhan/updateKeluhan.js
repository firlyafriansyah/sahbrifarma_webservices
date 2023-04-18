const { Keluhan, RiwayatBerobat, Pasien } = require("../../../../models");

module.exports = async (req, res) => {

  const id = req.params.id

  const keluhanData = await Keluhan.findOne({
    where: {id: id}
  })

  if (!keluhanData) {
    return res.status(404).json({
      status: 'error',
      message: 'Data tidak ditemukan!'
    })
  }

  const dataRiwayatBerobat = {
    id_pasien: req.body.idPasien,
    tanggal_berobat: new Date(),
    admin: req.body.admin,
    action: 'Update Keluhan'
  }

  await RiwayatBerobat.create(dataRiwayatBerobat);

  const { keluhan } = req.body;

  const pasien = await Pasien.findOne({
      where: {id: req.body.idPasien}
  })

  await pasien.update({ tanggal_berobat_terakhir	: new Date() });

  await keluhanData.update({keluhan})

  return res.json({
    status: 'success',
    keluhan
  })
}