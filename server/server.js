require('dotenv').config()
const express = require("express")
const { graphqlHTTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const fetch = require('node-fetch')

const schema = buildSchema(`
  enum Unit {
    standard
    metric
    imperial
  }

  type Weather {
    location: String!
    temparature: Float!
    description: String!
    feelsLike: Float!
    tempMin: Float!
    tempMax: Float!
    status: Int!
    message: String!
  }

  type Query {
    getWeather(zip: Int!, unit: Unit!): Weather
  }
`)

const root = {
  getWeather: async ({ zip, unit }) => {
    const units = { standard: '', metric: 'metric', imperial: 'imperial'}

    const api_key = process.OPEN_WEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather&zip=${zip}&appid=${api_key}&units=${units[unit]}`

    const result = await fetch(url)
    const json = await result.json()

    const status = parseInt(json.cod)

    if(status !== 200){
      return { status: status, message: json.message }
    } else {
      const temp = json.main.temp
      const description = json.weather[0].description
      const feelsLike = json.main.feels_like
      const tempMin = json.main.temp.temp_min
      const tempMax = json.main.temp_max
      const locationName= json.name

      return {
        temperature: temp,
        location: locationName,
        description: description,
        feelsLike: feelsLike,
        tempMin: tempMin,
        tempMax: tempMax,
        status: status
      }
    }
  }
}

const cors = require('cors')
const app = express()

app.use(cors())

app.use('graphql', graphglHTTP({
  schema,
  rootValue: root,
  graphiql: true
}))

const port = 4000
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})