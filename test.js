const boost = require('movehub-async');

boost.on('ble-ready', status => {
    console.log('ble-ready', status);
});

async function Robot() {
  const hub = await boost.getHubAsync();

  await hub.ledAsync('red');
  await hub.ledAsync('yellow');
  await hub.ledAsync('green');

  //await hub.motorTimeAsync('C', 3, -45, true);

  return hub;

};

async function ShakingHead(hub, speed){
  let locSpeed = (speed ? speed : 60);

  await hub.motorAngleAsync('C', 45, locSpeed, true);
  await hub.motorAngleAsync('C', 90, -locSpeed, true);
  await hub.motorAngleAsync('C', 52, locSpeed, true);

  return hub;
}

async function DriveSquary(hub, distance){

  let locDistance = (distance ? distance : 50);

  await hub.drive(locDistance);
  await hub.turn(90);
  await hub.drive(locDistance);
  await hub.turn(90);
  await hub.drive(locDistance);
  await hub.turn(90);
  await hub.drive(locDistance);
  await hub.turn(90);
  return hub;
}

async function DriveRoutine(hub,distance){

  let locDistance = (distance ? distance : 50);

  await hub.drive(locDistance);
  await hub.turn(360);
  await hub.drive(locDistance);
  await hub.turn(-90);
  await hub.drive(locDistance);
  await hub.turn(-90);
  await hub.drive(locDistance);
  await hub.turn(360);
  await hub.drive(locDistance);
  await hub.turn(-180);
  await hub.drive(locDistance);
  await hub.turn(90);

  return hub;

}



Robot().then((hub) => {

  console.log("Connected");

  return ShakingHead(hub, 30);

}).then((hub) => {

  console.log("Done Shaking");

  return DriveRoutine(hub, 75);

}).then((hub) => {

  console.log("Done Shaking");

});
