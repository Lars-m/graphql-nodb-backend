const express = require('express')
const gju = require("geojson-utils")
const {gameArea,players} = require("./gameData")
const app = express()
const graphqlHTTP = require("express-graphql")
const {buildSchema} = require("graphql")
const fetch = require("node-fetch")
const SERVER_URL = "http://localhost:3000"

const schema = buildSchema(`
  type Status{
    """
    TRUE if coordinates was inside gameArea, otherwise FALSE
    """
    status: String
    """
    Contains a string with a description of whether given coordinates was inside or not inside the gameArea
    """
    msg: String
  }

  
  type Coordinate {
    latitude: Float!
    longitude:Float!
  }
  
  type Coordinates {
    coordinates: [Coordinate]
  }

  """
  Contains userName of a Team found
  """
  type Name {
    name : String
  }
 

  type Point {
    """
    Will ALWAYS have the value Point
    """
    type : String
    """
    Array with longitude followed by latitude [lon,lat]
    """
    coordinates: [Float]
  }


  type Player {
    """
    Will ALWAYS have the value --> Feature <--
    """
    type: String
    """
    userName of Player (or Team)
    """
    properties : Name
    """
    GeoJson Point with the users location
    """
    geometry : Point
  }
  
  """
  Represents a user found, with the distance to the caller
  """
  type User {
    """
    Distance to the user seached for
    """
    distance: Float
    """
    userName of the user found
    """
    to: String
  }
  
  """
  Error for a call, with msg and statuscode
  """
  type Error {
    msg: String
    statuscode : Int
  }

  union Response = User | Error

  type Query {

    """
    Returns a GeoJson Polygon representing the legal gameArea
    """
    gameArea : Coordinates

     """
     Check whether caller, given his latitude and lontitude, is inside the gameArea
     """
     isUserInArea("Callers latitude" latitude: Float!,"Callers longitude" longitude:Float!) : Status!

     """
     Given callers latitude and longitude all nearby Teams will be found (inside the given radius)
     """
     findNearbyPlayers(latitude: Float!, longitude: Float!,distance: Int!):[Player]!
     
     """
     Given callers latitude and longitude, and the userName of the Team to find, returs the distance to this Team
     """
     distanceToUser("callers latitude" latitude: Float!, 
                    "callers longitude" longitude: Float!, 
                    "user to find" userName: String) : User! 
  }
`)

const root = {
  isUserInArea: async ({longitude,latitude}) => {
    const res = await fetch(`${SERVER_URL}/geoapi/isuserinarea/${longitude}/${latitude}`).then(res=>res.json())
    return {status:res.status,msg:res.msg}
  },
  gameArea : async () => {
    const gameArea = await fetch(`${SERVER_URL}/geoapi/gamearea`).then(res=>res.json())
    return gameArea
  },
  findNearbyPlayers: async ({longitude,latitude,distance}) => {
    const res = await fetch(`${SERVER_URL}/geoapi/findNearbyPlayers/${longitude}/${latitude}/${distance}`).then(res=>res.json())
    return res
  },
  distanceToUser: async ({longitude,latitude,userName}) => {
    const res = await fetch(`${SERVER_URL}/geoapi/distanceToUser/${longitude}/${latitude}/${userName}`).then(res=>res.json())
    if(!res.distance){
      throw new Error("User not found")
    }
    return res
  }
}


/*
 Create a new polygon meant to be used on clients by React Native's MapView which
 requres an object as the one we create below 
 NOTE --> how we swap longitude, latitude values
*/
polygonForClient = {};
polygonForClient.coordinates = gameArea.coordinates[0].map(point => {
  return {latitude: point[1],longitude: point[0]}
})

app.use("/geographql",graphqlHTTP({
  schema,
  rootValue:root,
  graphiql:true
}))

//Returns a polygon, representing the gameArea
app.get("/geoapi/gamearea",(req,res)=>{
  res.json(polygonForClient);
});

app.get('/geoapi/isuserinarea/:lon/:lat', function(req, res) {
  const lon = req.params.lon;
  const lat = req.params.lat;
  const point = {"type":"Point","coordinates":[lon,lat]}
  let isInside = gju.pointInPolygon(point,gameArea);
  let result = {};
  result.status = isInside;
  let msg = isInside ? "Point was inside the tested polygon":
                       "Point was NOT inside tested polygon";
  result.msg = msg;
  res.json(result);
});

app.get('/geoapi/findNearbyPlayers/:lon/:lat/:rad', function(req, res) {
  const lon = Number(req.params.lon);
  const lat = Number(req.params.lat);
  const rad = Number(req.params.rad);
  const point = {"type":"Point","coordinates":[lon,lat]}
  let isInside = gju.pointInPolygon(point,gameArea);
  let result = [];
  players.forEach(player => {
     if (gju.geometryWithinRadius(player.geometry, point, rad)) {
      result.push(player);
    }
  })
  res.json(result);
});

app.get('/geoapi/distanceToUser/:lon/:lat/:username', function(req, res) {
  const {lon,lat,username} = req.params
  const point = {"type":"Point","coordinates":[Number(lon),Number(lat)]}
  console.log(point,username);
  const user = players.find((player)=> {
    return player.properties.name===username
  });
  if(!user){
    res.status(404);
    return res.json({msg:"User not found"});
  }
  let distance = gju.pointDistance(point,user.geometry);
  result = {distance:distance,to:username}
  res.json(result);
});

app.get('/', (req, res) => res.send('Geo Demo!'))
app.listen(3000, () => console.log('Example app listening on port 3000!'))
