const { HasilPeriksa, RiwayatBerobat, Pasien } = require("../../../../models");

module.exports = async (req, res) => {

  const id = req.params.id
  
  const hasilPeriksa = await HasilPeriksa.findOne({
    where: {id: id}
  })

  if (!hasilPeriksa) {
    return res.status(404).json({
      status: 'error',
      message: 'Data tidak ditemukan!'
    })
  }

  const dataRiwayatBerobat = {
    id_pasien: req.body.idPasien,
    tanggal_berobat: new Date(),
    admin: req.body.admin,
    action: 'Hapus Hasil Periksa'
  }

  const pasien = await Pasien.findOne({
      where: {id: req.body.idPasien}
  })

  await pasien.update({ tanggal_berobat_terakhir	: new Date() });

  await RiwayatBerobat.create(dataRiwayatBerobat);
  
  await hasilPeriksa.destroy();

  return res.json({
    status: 'success',
    hasilPeriksa,
  });
};
