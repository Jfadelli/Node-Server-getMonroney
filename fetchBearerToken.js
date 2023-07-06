const puppeteer = require('puppeteer')
require('dotenv').config()

async function fetchBearerToken () {
  const loginUrl =  process.env.URL_HOME
  const username = process.env.USER_NAME
  const password = process.env.PASSWORD
  const urlVehicleLocator = process.env.URL_VEHICLE_LOCATOR
  const searchEndpoint = process.env.SEARCH_ENDPOINT

  // Launch a new browser instance
  const browser = await puppeteer.launch({ headless: true })

  // Create a new page
  const page = await browser.newPage()

  // Set the navigation timeout to a longer duration (e.g., 60 seconds)
  await page.setDefaultNavigationTimeout(4000)

  // Store the bearer token
  let bearerToken = ''

  // Capture the request headers
  page.on('request', async (request) => {
    const url = request.url()

    // Check if this is the request you're interested in
    if (url === searchEndpoint) {
      const headers = request.headers()
      const authHeader = Object.entries(headers).find(([key]) => key.toLowerCase() === 'authorization')

      if (authHeader) {
        bearerToken = authHeader[1].replace('Bearer ', '')
        return bearerToken
      }
    }
  })

  // Go to the login page of the website
  await page.goto(loginUrl)

  // Inspect the elements on the current page after possible redirection
  await page.waitForSelector('#signInName', { visible: true })
  await page.waitForSelector('#password', { visible: true })
  await page.waitForSelector('#next', { visible: true })
  console.log('Found all elements on the login page. \n loggin in...')

  // Input username and password
  await page.type('#signInName', username)
  await page.type('#password', password)

  // Click on the next button
  await page.click('#next')

  // Wait for the navigation to complete
  await page.waitForNavigation()

  await page.goto(urlVehicleLocator)

  // Close the browser
  await browser.close()
  return bearerToken
}
module.exports = {
  fetchBearerToken
}
