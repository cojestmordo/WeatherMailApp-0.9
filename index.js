const http = require('http');
const cron = require('node-cron');
const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const env = require('dotenv');
env.config();


const app = express();

const port = process.env.PORT 
const api_key = process.env.API_KEY
const mail_user = process.env.MAIL_USER
const mail_key = process.env.MAIL_KEY

app.get("/", (req, res) => {
	res.send('Hello World!')
})


cron.schedule('1 32 3 * * *', () => {


	const apiPath = `http://api.weatherapi.com/v1/forecast.json?key=${api_key}&q=Poznan&days=2&aqi=no&alerts=no`

	const sendGetRequest = async () => {
		try{
			const resp = await axios.get(apiPath);
			
			const date = resp.data.forecast.forecastday[0].date;
			const condition = resp.data.forecast.forecastday[0].day.condition.text;	
			const avgTemp = resp.data.forecast.forecastday[0].day.avgtemp_c;
			const willItRain = resp.data.forecast.forecastday[0].day.daily_will_it_rain;
			const chanceOfRain = resp.data.forecast.forecastday[0].day.daily_chance_of_rain;

			console.log(date);
			console.log(condition);
			console.log(avgTemp);
			console.log(willItRain);
			console.log(chanceOfRain);




			let transporter = nodemailer.createTransport({
				service: 'SendinBlue',
				auth: {
					user: mail_user,
					pass: mail_key
				},
				logger: true
			});

			let info = await transporter.sendMail({
				from:'"Fred Foo" <foo@example.com>',
				to:'lordmada2012@gmail.com',
				subject:"Hello",
				text:`test date is ${date}`,
				html: `<b>Todays date is ${date}<br/>
					Weather in Poznan is: ${condition}<br/>
					Avg Temperature will be ${avgTemp}<br/>
					Will it rain? Prolly ${willItRain}<br/>
					Chanse of rain is ${chanceOfRain}<br/>
				<b>`,
			});

		} catch(err) {
			console.error(err);
		}
		}

	sendGetRequest().catch(console.error);

});

app.listen(port, () => {
	console.log(`Server running on port ${port}/`);
});
