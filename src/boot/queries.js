const all_stations = `
{
  stations {
    gtfsId
    name
    lat
    lon
  }
}`;

const plan_transit_walk = `

query SummaryPage_WalkBike_Query(
  $fromPlace: String!
  $toPlace: String!
  $date: String!
  $time: String!
  $arriveBy: Boolean
  $locale: String
  $pageCursor: String
)
  {
    plan(
      fromPlace: $fromPlace,
      toPlace: $toPlace,
      transportModes: [
        {mode: TRANSIT},
        {mode: WALK}
      ],
      date: $date,
      time: $time,
      locale: $locale
      maxWalkDistance: 100
      wheelchair: false,
      arriveBy: $arriveBy,
      pageCursor: $pageCursor
    ) {
      previousPageCursor
      nextPageCursor
      searchWindowUsed
      itineraries {
        duration
        startTime
        endTime
        legs {
          startTime
          endTime
          route {
            shortName
            longName
          }
          mode
          from {
            name
            lat
            lon
            stop {
              gtfsId
            }
          }
          to {
            name
            lat
            lon
            stop {
              gtfsId
            }
          }
          intermediatePlaces {
            arrivalTime
            stop {
              lat
              lon
              name
            }
          }
          mode
          legGeometry {
            points
          }
          distance
        }
      }
    }
  }`;

export { all_stations, plan_transit_walk };
