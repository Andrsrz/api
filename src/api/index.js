import { Router } from 'express'
import org from './org'
var session = require('express-session')

const router = new Router()

var sess = {
  secret: 'keyboard cat',
  cookie: {}
}

if (router.get('env') === 'production') {
  router.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

router.use(session(sess));
console.log("STARTED SESS MGMT");

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
