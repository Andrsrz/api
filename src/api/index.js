import { Router } from 'express'
import org from './org'
var session = require('express-session')
require('dotenv').load()
const router = new Router()
const MongoStore = require('connect-mongo')(session);
const secret = process.env.SESSION_SECRET || "este secret es para pruebas porque el bueno no debe estar commiteado en el repo";
const storeurl = process.env.SESSION_MONGO_URL || "mongodb://10.233.2.65:27017/sessions";
var sess = {
  secret: secret,
  store: new MongoStore({
      url: storeurl,
      ttl: 30 * 24 * 60 * 60 // = 30 días
    }),
  fallbackMemory: true
}

if (router.get('env') === 'production') {
  router.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

router.use(session(sess));

function secure(req,res,next){
  console.log("usuario: ", req.session.currentUser)
  console.log(req.session)
  if(req.session.currentUser){
    next(); }
  else{
    res.redirect('/login'); }}

router.post('/', secure);
router.put('/', secure);

router.use('/', org)

/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */

export default router
