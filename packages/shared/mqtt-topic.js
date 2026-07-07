function getDeviceTopic(deviceId) {
  return `device/${deviceId}/data`;
}

export default { getDeviceTopic };