var awsIot = require('aws-iot-device-sdk');
const boost = require('movehub-async');

boost.on('ble-ready', status => {
    console.log('ble-ready', status);
});
//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts
// to connect with a client identifier which is already in use, the existing
// connection will be terminated.
//

const config = require('./config.json');

const SHADOWID = "PiZeroRobotHub";

var thingShadows = awsIot.thingShadow({
   keyPath: config.keyPath,
  certPath: config.certPath,
    caPath: config.caPath,
  clientId: config.SHADOWID,
      host: config.host
});


var globalRobot = false;
var isConnected = false;
var clientTokenUpdate;

function setConnectionStatus(status){
  console.log("setConnectionStatus", status);
  var bluetoothConnectionState = {"state":{"desired":{"btconnected":status}}};
  isConnected = status;

  var clientTokenUpdate = thingShadows.update(config.SHADOWID, bluetoothConnectionState  );

  if (clientTokenUpdate === null){
      console.log('update shadow failed, operation still in progress');
  }

  return clientTokenUpdate;
}

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
thingShadows
  .on('connect', function() {
    console.log('connect');

    thingShadows.register( config.SHADOWID, {}, function() {
      console.log("register Shadow device");
      clientTokenUpdate = setConnectionStatus(false);
    });

    thingShadows.subscribe('LegoBoostRobot');

//  device.publish('topic_2', JSON.stringify({ test_data: 1}));
  });

thingShadows
  .on('message', function(topic, payload) {
    let jsonPayload = JSON.parse(payload.toString());
    console.log('Receive info', topic, jsonPayload);
    if(topic == "LegoBoostRobot") LegoBoostRobot(jsonPayload);
  });


function LegoBoostRobot(jsonPayload){
  console.log("LegoBoostRobot", jsonPayload.robotcmd, jsonPayload.robotaction);
  if(jsonPayload.robotcmd) {
    if(jsonPayload.robotcmd == "connect") {
      console.log("LegoBoostRobot - connect");
      Robot().then((hub) => {
        console.log("Move Hub is Connected");
        clientTokenUpdate = setConnectionStatus(true);
        globalRobot = hub;
        globalRobot
          .on('disconnect', function(){
            console.log("Move Hub is disconnected");
            clientTokenUpdate = setConnectionStatus(false);
        });
      });
    } else if(jsonPayload.robotcmd == "disconnect") {
        console.log("LegoBoostRobot - disconnect");
        if(globalRobot) {
          (async() => {
            await globalRobot.disconnect();
          })();
        }
    } else if(jsonPayload.robotcmd == "light") {
        console.log("LegoBoostRobot - light", jsonPayload.robotaction);
        if(globalRobot) {
          (async() => {
            await globalRobot.ledAsync(jsonPayload.robotaction);
          })();
        }
    } else if(jsonPayload.robotcmd == "drive") {
        console.log("LegoBoostRobot - drive", jsonPayload.robotaction);
        if(globalRobot) {
          (async() => {
            await globalRobot.drive(jsonPayload.robotaction);
          })();
        }
    } else if(jsonPayload.robotcmd == "shakinghead") {
        console.log("LegoBoostRobot - shakinghead", jsonPayload.robotaction);
        if(globalRobot) {
          ShakingHead(globalRobot, 60).then((hub) => {
            console.log("Completed shakinghead");
          });
        }
    } else if(jsonPayload.robotcmd == "drivesquary") {
        console.log("LegoBoostRobot - drivesquary", jsonPayload.robotaction);
        if(globalRobot) {
          DriveSquary(globalRobot, 50).then((hub) => {
            console.log("DriveSquary Completed");
          });
        }
    } else if(jsonPayload.robotcmd == "driveroutine") {
        console.log("LegoBoostRobot - driveroutine", jsonPayload.robotaction);
        if(globalRobot) {
          DriveSquary(globalRobot, 50).then((hub) => {
            console.log("DriveRoutine Completed");
          });
        }
    } else if(jsonPayload.robotcmd == "spinner") {
        console.log("LegoBoostRobot - spinner", jsonPayload.robotaction);
        if(globalRobot) {
          Spinner(globalRobot).then((hub) => {
            console.log("Spinner Completed");
          });
        }
    }
  }
};

async function Robot() {
  const hub = await boost.getHubAsync();
  await hub.ledAsync('red');
  await hub.ledAsync('yellow');
  await hub.ledAsync('green');
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

async function Spinner(hub, speed){

  let locSpeed = (speed ? speed : 80);

  await hub.motorAngleAsync('C', 45, locSpeed);
  await hub.motorAngleAsync('C', 90, -locSpeed);
  await hub.motorAngleAsync('C', 52, locSpeed);

  await hub.ledAsync('yellow');
  await hub.turn(4*360);

  await hub.ledAsync('blue');
  await hub.motorAngleAsync('C', 45, locSpeed);
  await hub.motorAngleAsync('C', 90, -locSpeed);
  await hub.motorAngleAsync('C', 52, locSpeed);

  await hub.motorAngleAsync('C', 45, locSpeed);
  await hub.motorAngleAsync('C', 90, -locSpeed);
  await hub.motorAngleAsync('C', 52, locSpeed);

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
