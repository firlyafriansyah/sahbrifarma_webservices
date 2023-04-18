const { HasilPeriksa, RiwayatBerobat, Pasien } = require("../../../../models");

module.exports = async (req, res) => {

  const id = req.params.id;

  const dataHasilPeriksa = {
    id_pasien: id,
    tensi_darah: req.body.tensi_darah,
    gula_darah: req.body.gula_darah,
    asam_urat: req.body.asam_urat,
    kolestrol: req.body.kolestrol,
    anamnesa: req.body.anamnesa,
    diagnosis: req.body.diagnosis,
    keterangan: req.body.keterangan,
    tanggal_berobat: new Date()
  }

  const dataRiwayatBerobat = {
    id_pasien: id,
    tanggal_berobat: new Date(),
    admin: req.body.admin,
    action: 'Tambah Hasil Periksa'
  }
  
  const pasien = await Pasien.findOne({
    where: {id}
  })

  if (!pasien) {
    return res.status(404).json({
      status: 'error',
      message: 'Pasien tidak ditemukan!'
    })
  }

  await pasien.update({ tanggal_berobat_terakhir	: new Date() });

  await RiwayatBerobat.create(dataRiwayatBerobat);
  
  const hasilPeriksa = await HasilPeriksa.create(dataHasilPeriksa);

  return res.json({
    status: 'success',
    hasilPeriksa,
  });
};
