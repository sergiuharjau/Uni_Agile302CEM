#!/usr/bin/env node

/**
 * Routes File
 */

'use strict'

require('dotenv').config()

/* MODULE IMPORTS */
const bcrypt = require('bcrypt-promise')
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})
const session = require('koa-session')
const sqlite = require('sqlite-async')
const fs = require('fs-extra')
const mime = require('mime-types')
const mqtt = require('mqtt')
const WebSocket = require('ws');

//const jimp = require('jimp')

/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')

const app = new Koa()
const router = new Router()

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))


const defaultPort = 8080
const port = process.env.PORT || defaultPort
const dbName = 'website.db'
const saltRounds = 10


const wss = new WebSocket.Server({
	port: 3000,
	perMessageDeflate: {
	  zlibDeflateOptions: {
		// See zlib defaults.
		chunkSize: 1024,
		memLevel: 7,
		level: 3
	  },
	  zlibInflateOptions: {
		chunkSize: 10 * 1024
	  },
	  // Other options settable:
	  clientNoContextTakeover: true, // Defaults to negotiated value.
	  serverNoContextTakeover: true, // Defaults to negotiated value.
	  serverMaxWindowBits: 10, // Defaults to negotiated value.
	  // Below options specified as default values.
	  concurrencyLimit: 10, // Limits zlib concurrency for perf.
	  threshold: 1024 // Size (in bytes) below which messages
	  // should not be compressed.
	}
  });
/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */


router.get('/', async ctx => {
	
	try {
		// if(ctx.session.authorised !== true) return ctx.redirect('/login?msg=you need to log in')
		// const data = {}
		// if(ctx.query.msg) data.msg = ctx.query.msg

		wss.on('connection', function connection(ws) {

			const mqttOptions = {
				host: process.env.MQTT_HOST,
				protocol: process.env.MQTT_PROTOCOL,
				username: process.env.MQTT_USERNAME,
				password: process.env.MQTT_PASSWORD,
				port: process.env.MQTT_PORT,
			}

			const client = mqtt.connect(process.env.MQTT_HOST, mqttOptions)

			client.on('connect', function () {
				client.subscribe('302CEM/placeholder', function (err) {
					if (!err) {
						client.publish('302CEM/placeholder', 'Website connected')
					}
				})
			})
			
			client.on('message', function(topic, message, packet){
				ws.send(`${topic}: ${message.toString()}`)
			})


		});
		
		await ctx.render('index')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		console.log(body)
		const {path, type} = ctx.request.files.avatar
		// call the functions in the module
		const user = await new User(dbName)
		await user.register(body.user, body.pass)
		// await user.uploadPicture(path, type)
		// redirect to the home page
		ctx.redirect(`/?msg=new user "${body.name}" added`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/login', async ctx => {
	const data = {}
	if(ctx.query.msg) data.msg = ctx.query.msg
	if(ctx.query.user) data.user = ctx.query.user
	await ctx.render('login', data)
})

router.post('/login', async ctx => {
	try {
		const body = ctx.request.body
		const user = await new User(dbName)
		await user.login(body.user, body.pass)
		ctx.session.authorised = true
		return ctx.redirect('/?msg=you are now logged in...')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = null
	ctx.redirect('/?msg=you are now logged out')
})

app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))
