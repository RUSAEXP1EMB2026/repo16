function recordSensorData() {

  const deviceData = getNatureRemoData("devices");
  const lastSensorData = getLastData("sensor");

  const discomfort =
    0.81 * deviceData[0].newest_events.te.val +
    0.01 * deviceData[0].newest_events.hu.val *
    (0.99 * deviceData[0].newest_events.te.val - 14.3) +
    46.3;

  const arg = {
    te: deviceData[0].newest_events.te.val,
    hu: deviceData[0].newest_events.hu.val,
    mo: deviceData[0].newest_events.mo.val,
    di: Math.round(discomfort * 10) / 10
  };

  setSensorData(arg, lastSensorData + 1);

  sendLineMessage(arg);
}