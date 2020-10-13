class Fanlight {

  constructor() {
    this.thedevice = null;
    this.gattserve = null;
    this.Txchartic = null;
    this.onDisconnected = this.onDisconnected.bind(this);
  }

  /**
   * @requires
   * Scan the nearby Bluetooth and click the connection
   */
  request() {
    let options = {
      acceptAllDevices: true,
      optionalServices: ["00010203-0405-0607-0809-0a0b0c0d1912","00001810-0000-1000-8000-00805f9b34fb"]
      };
    return navigator.bluetooth.requestDevice(options)
    .then(device => {
      this.thedevice = device;
      addLoginfo('Name:             ' + device.name);
      addLoginfo('Id:               ' + device.id);
      addLoginfo('Connected:        ' + device.gatt.connected);
      device.addEventListener('gattserverdisconnected', this.onDisconnected)
      return device.gatt.connect();
    })
    .then(server => {
      addLoginfo('Getting Service...');
      this.gattserve = server;
      return server.getPrimaryService("00010203-0405-0607-0809-0a0b0c0d1912");
    })
    .then(service => {
      addLoginfo('Getting Characteristic...');
      addLoginfo('service UUID:              ' + service.uuid);
      return service.getCharacteristic("00010203-0405-0607-0809-0a0b0c0d2b12");
    })
    .then(characteristic => {
      this.Txchartic = characteristic;
      addLoginfo('write Characteristic UUID: ' + characteristic.uuid);
      OTA_Authorization(this.gattserve);
    });
  }

  /**
   * @disconnect
   * Disconnect from the device
   */
  disconnect() {
    if (!this.thedevice) {
      return Promise.reject('Device is not connected.');
    }
    return this.thedevice.gatt.disconnect();
  }

  /**
   * @onDisconnected
   * Bluetooth device disconnect execution function
   */
  onDisconnected() {
    addLoginfo('Device is disconnected.');
  }

  /**
   * @readOTAmode
   * Read values by characteristic
   */
  readOTAmode() {
    return this.gattserve.getPrimaryService("00010203-0405-0607-0809-0a0b0c0d1912")
    .then(service => service.getCharacteristic("00010203-0405-0607-0809-0a0b0c0d2b12"))
    .then(characteristic => {
      console.log("na dao read chartic");
      console.log(characteristic);
      characteristic.readValue().then(result => {
        console.log(result);
        console.log(result.getUint8(0));
        //console.log(result.getUint8(1));
        return result;
      });
    });
  }

  /**
   * @reachardata
   * Read values by characteristic
   */
  reachardata(){
    this.Txchartic.readValue().then(result => {
      for(let i = 0; i < result.byteLength; i++){
        addLoginfo("Read result getUint8(" + i + "): " + result.getUint8(i));
      }
    })
  }
}