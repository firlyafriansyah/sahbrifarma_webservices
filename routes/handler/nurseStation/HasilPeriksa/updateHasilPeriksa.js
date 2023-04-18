const { HasilPeriksa, RiwayatBerobat, Pasien } = require("../../../../models");

module.exports = async (req, res) => {

  const id = req.params.id;

  const hasilPeriksa = await HasilPeriksa.findOne({
    where: {id: id}
  });

  if (!hasilPeriksa) {
    return res.status(404).json({
      status: 'error',
      message: "Pasien tidak ditemukan!"
    })
  }

  const dataRiwayatBerobat = {
    id_pasien: req.body.idPasien,
    tanggal_berobat: new Date(),
    admin: req.body.admin,
    action: 'Update Hasil Periksa',
  }

  await RiwayatBerobat.create(dataRiwayatBerobat);


  const { tensi_darah, gula_darah, asam_urat, kolestrol, anamnesa, diagnosis, keterangan } = req.body;

  const pasien = await Pasien.findOne({
      where: {id: req.body.idPasien}
  })

  await pasien.update({ tanggal_berobat_terakhir	: new Date() });

  await hasilPeriksa.update({
    tensi_darah, gula_darah, asam_urat, kolestrol, anamnesa, diagnosis, keterangan
  })

  return res.json({
    status: 'success',
    hasilPeriksa
  })
}