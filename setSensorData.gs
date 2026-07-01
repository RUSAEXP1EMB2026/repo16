function setSensorData(data, row) {

  getSheet("sensor")
    .getRange(row, 1, 1, 5)
    .setValues([[
      new Date(),
      data.te,
      data.hu,
      data.mo,
      data.di
    ]]);
}
