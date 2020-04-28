
 const gameArea = {
        "type": "Polygon",
        "coordinates": [
          [
            [
              12.544240951538086,
              55.77594546428934
            ],
            [
              12.549219131469727,
              55.77502825125135
            ],
            [
              12.568359375,
              55.77604201177451
            ],
            [
              12.578487396240234,
              55.7767661102896
            ],
            [
              12.573423385620117,
              55.79467119920912
            ],
            [
              12.57059097290039,
              55.795877445664104
            ],
            [
              12.544240951538086,
              55.77594546428934
            ]
          ]
        ]
      }
  const players = [
    {
      "type": "Feature",
      "properties": {
        "name": "Team1-inside"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.567672729492188,
          55.78670903555303
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Team2-inside"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.561578750610352,
          55.779758908094266
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {"name":"Team3-outside"},
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.551965713500977,
          55.788349856956444
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {"name":"Team4-outside"},
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.568788528442383,
          55.77396618813479
        ]
      }
    }
  ]

  module.exports = {gameArea,players}
